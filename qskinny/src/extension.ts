import * as vscode from 'vscode';

class CppMacro {
  constructor(public name: string, public parameters: string[]) { }
}

/**
 * @param name Pattern of the macros's name
 * @param line The line as string to seach for the macro
 * @returns Returns an instance of a CppMacro
 */
function qskMacroParameters(name: string, line: string): CppMacro | null {
  const regex = new RegExp(`^(${name})\\s*\\((.*)\\)$`);
  const match = line.match(regex);
  if (!match) {
    return null;
  }

  const macro = new CppMacro(match[1].trim(), match[2].split(',').map(s => s.trim()));
  return macro;
}

/**
 * @param line The line number in the active document
 * @param fallback The name to return if the search fails
 * @returns Returns the first class or struct's name declared before @p line
 */
function qskFindClassnameBeforeLine(line: number, fallback = 'Q'): string {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return fallback;
  }
  const document = editor.document;
  if (!document) {
    return fallback;
  }

  let skinnable = fallback;

  // find candidate for the class name
  for (let lineNumber = line - 1; lineNumber > 0; lineNumber--) {
    const lineText = document.lineAt(lineNumber).text;
    const match = lineText.match(/(?:class|struct).*\s+(\w+)\s*:/);
    if (match) {
      skinnable = match[1].trim();
      return skinnable;
    }
  }
  return fallback;
}

function qskMacroTransformation(macroname: string, transform: (skinnable: string, subcontrol: string, index: number) => string): void {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    const range = new vscode.Range(selection.start, selection.end);
    const surroundedText = editor.document.getText(range);
    const document = editor.document;

    // TODO add multi line support
    const macro = qskMacroParameters(macroname, surroundedText);

    // if surrounded text matches QSK_STATES declaration
    if (macro) {
      let skinnable = qskFindClassnameBeforeLine(selection.start.line, 'Q');

      let subcontrols = macro.parameters;
      if (subcontrols.length > 0) {
        let index = 0;
        subcontrols = subcontrols.map(subcontrol => transform(skinnable, subcontrol, index++));

        const textToCopy = subcontrols.join(document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
        vscode.env.clipboard.writeText(textToCopy).then(() => {
          vscode.window.showInformationMessage('Copied to clipboard: ' + textToCopy);
        }, (error) => {
          vscode.window.showErrorMessage('Failed to copy to clipboard: ' + error);
        });
      }
    } else {
      vscode.window.showErrorMessage(`"${surroundedText}" doesn't match QSK_STATES(...) declaration!`);
    }
  }
}

function activate(context: vscode.ExtensionContext): void {
  console.log('Congratulations, your extension "qskinny" is now active!');

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_subcontrols.qsk_subcontrol', () => {
    qskMacroTransformation('QSK_SUBCONTROLS', (skinnable, subcontrol, index) => `QSK_SUBCONTROL( ${skinnable}, ${subcontrol} )`);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_subcontrols.qsk_subcontrols_if', () => {
    qskMacroTransformation('QSK_SUBCONTROLS', (skinnable, subcontrol, index) =>
    ((index > 0 ? "else " : "") +
      `if ( subControl == ${skinnable}::${subcontrol} )\n{\n}`)
    );
  }));

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_states.qsk_state', () => {
    qskMacroTransformation('QSK_STATES', (skinnable, subcontrol, index) => `QSK_STATE( ${skinnable}, ${subcontrol}, QskAspect::FirstUserState << ${index} )`);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_states.qsk_system_state', () => {
    qskMacroTransformation('QSK_STATES', (skinnable, subcontrol, index) => `QSK_SYSTEM_STATE( ${skinnable}, ${subcontrol}, QskAspect::FirstSystemState << ${index} )`);
  }));
}

function deactivate(): void { }

export {
  activate,
  deactivate
};
