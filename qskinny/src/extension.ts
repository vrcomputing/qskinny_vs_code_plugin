import * as vscode from 'vscode';

class CppMacro {
  constructor(public name: string, public parameters: string[]) { }
}

class CppEnumeration {
  constructor(public name: string, public enumerators: string[]) { }
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

function qskNodeRoleTransformation(transform: (skinnable: string, enumeration: CppEnumeration) => string[]) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    const range = new vscode.Range(selection.start, selection.end);
    const selectedLines: string[] = [];

    for (let lineNumber = selection.start.line; lineNumber <= selection.end.line; lineNumber++) {
      const lineText = editor.document.lineAt(lineNumber).text;
      selectedLines.push(lineText);
    }

    const line = selectedLines.join('');
    const match = line.match(/enum\s+(\w+)\s*\{(.*)\}/);
    if (match) {
      const name = match[1];
      const enumerators = match[2].split(',').map(s => s.trim().split('=')[0].trim());
      console.log(enumerators);
      const enumeration = new CppEnumeration(name, enumerators);

      let skinlet = qskFindClassnameBeforeLine(selection.start.line, 'Q');
      const lines = transform(skinlet, enumeration);
      const textToCopy = lines.join(editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
      vscode.env.clipboard.writeText(textToCopy).then(() => {
        vscode.window.showInformationMessage('Copied to clipboard: ' + textToCopy);
      }, (error) => {
        vscode.window.showErrorMessage('Failed to copy to clipboard: ' + error);
      });
    }
    else {
      vscode.window.showErrorMessage(`Invalid enum declaration!`);
    }
  }
}

function qskMacroTransformation(macroname: string, transform: (skinnable: string, macro: CppMacro) => string[]): void {
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
      const lines = transform(skinnable, macro);

      if (lines.length > 0) {
        const textToCopy = lines.join(document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
        vscode.env.clipboard.writeText(textToCopy).then(() => {
          vscode.window.showInformationMessage('Copied to clipboard: ' + textToCopy);
        }, (error) => {
          vscode.window.showErrorMessage('Failed to copy to clipboard: ' + error);
        });
      }
    } else {
      vscode.window.showErrorMessage(`Invalid "${macroname}" declaration!`);
    }
  }
}

function activate(context: vscode.ExtensionContext): void {
  console.log('Congratulations, your extension "qskinny" is now active!');

  // qsk subcontrol transformations

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_subcontrols.qsk_subcontrol', () => {
    qskMacroTransformation('QSK_SUBCONTROLS', (skinnable, macro) => macro.parameters.map(subcontrol => `QSK_SUBCONTROL( ${skinnable}, ${subcontrol} )`));
  }));

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_subcontrols.qsk_subcontrols_if', () => {
    let index = 0;
    qskMacroTransformation('QSK_SUBCONTROLS', (skinnable, macro) => macro.parameters.map(subcontrol => (index++ > 0 ? 'else ' : '') + `if ( subControl == ${skinnable}::${subcontrol} )\n{\n}`));
  }));

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.subcontrols.noderoles', () => {
    qskMacroTransformation('QSK_SUBCONTROLS', (skinnable, macro) => {
      return ['enum NodeRole', '{']
        .concat(macro.parameters.map(subcontrol => `\t${subcontrol},`))
        .concat(['};']);
    });
  }));

  // qsk states transformations

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_states.qsk_state', () => {
    let index = 0;
    qskMacroTransformation('QSK_STATES', (skinnable, macro) => macro.parameters.map(subcontrol => `QSK_STATE( ${skinnable}, ${subcontrol}, QskAspect::FirstUserState << ${index++} )`));
  }));

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.states.systemstate', () => {
    let index = 0;
    qskMacroTransformation('QSK_STATES', (skinnable, macro) => macro.parameters.map(subcontrol => `QSK_SYSTEM_STATE( ${skinnable}, ${subcontrol}, QskAspect::FirstSystemState << ${index} )`));
  }));

  // enum transformations 

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.noderoles.switch', () => {
    qskNodeRoleTransformation((skinlet, enumeration) =>
      [`switch(static_cast<${skinlet}::${enumeration.name}>(role))`, '{']
        .concat(enumeration.enumerators.map(role => `\tcase ${skinlet}::${enumeration.name}::${role}:\n\t\tbreak;`)
          .concat(['\tdefault:', '\t\tbreak;'])
          .concat(['}'])
        ));
  }));

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.noderoles.template.subcontrol', () => {
    qskNodeRoleTransformation((skinlet, enumeration) => [
      `// TODO move to .h file`,
      `template<${enumeration.name}>`,
      `Q_REQUIRED_RESULT QSGNode* updateSubNode( const QskSkinnable* skinnable, QSGNode* node) const;`,
      ``,
      `// TODO move to .cpp file`,
      `template<${enumeration.name}>`,
      `QSGNode* ${skinlet}::updateSubNode( const QskSkinnable* skinnable, QSGNode* node) const = delete;`,
      ``
    ].concat(enumeration.enumerators.map(role => `template<>\nQSGNode* ${skinlet}::updateSubNode<${skinlet}::${enumeration.name}::${role}>( const QskSkinnable* skinnable, QSGNode* node) const\n{\n}\n`)
    ));
  }));

  context.subscriptions.push(vscode.commands.registerCommand('qskinny.noderoles.template.switch', () => {
    qskNodeRoleTransformation((skinlet, enumeration) =>
      [
        `QSGNode* ${skinlet}::updateSubNode( const QskSkinnable* skinnable, const quint8 role, QSGNode* const node ) const override;`,
        `{`,
        `switch( static_cast< ${skinlet}::${enumeration.name} >( role ) )`,
        `{`
      ]
        .concat(enumeration.enumerators.map(role => `case ${skinlet}::${enumeration.name}::${role}: return updateSubNode<${skinlet}::${enumeration.name}::${role}>(skinnable, node);`))
        .concat([`default: return Inherited::updateSubNode(skinnable, role, node);`, `}`, `}`])
    );
  }));


}

function deactivate(): void { }

export {
  activate,
  deactivate
};
