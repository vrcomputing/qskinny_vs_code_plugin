// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

class CppMacro {
	constructor(name, parameters) {
		this.name = name;
		this.parameters = parameters;
	}
}

/**
 * @param name Pattern of the macros's name
 * @param line The line as string to seach for the macro
 * @returns Returns an instance of a CppMacro
 */
function qskMacroParameters(name, line) {
	const regex = new RegExp(`^(${name})\s*\\((.*)\\)$`);
	const match = line.match(regex);
	if (!match) {
		return null;
	}

	let macro = new CppMacro(match[1].trim(), match[2].split(',').map(s => s.trim()));
	return macro;
}

/**
 * 
 * @param {int} line The line number in the active document
 * @param {string} fallback The name to return if the search fails
 * @returns Returns the first class or struct's name declared before @p line
 */
function qskFindClassnameBeforeLine(line, fallback = 'Q') {

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return fallback;
	}
	const document = editor.document;
	if (!document) {
		return fallback;
	}

	// find candidate for the class name
	for (let lineNumber = line - 1; lineNumber > 0; lineNumber--) {
		const lineText = document.lineAt(lineNumber).text;
		let match = lineText.match(/(?:class|struct).*\s+(\w+)\s*:/)
		if (match) {
			skinnable = match[1].trim();
			return skinnable;
		}
	}
	return fallback;
}

function qskStatesToQskState(transform) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const selection = editor.selection;
		const range = new vscode.Range(selection.start, selection.end);
		const surroundedText = editor.document.getText(range);
		const document = editor.document;

		// TODO add multi line support
		const macro = qskMacroParameters('QSK_STATES', surroundedText);

		// if surrounded text matches QSK_STATES declaration
		if (macro) {
			let skinnable = qskFindClassnameBeforeLine(selection.start.line, 'Q');

			let subcontrols = macro.parameters;
			if (subcontrols.length > 0) {
				let index = 0;
				subcontrols = subcontrols.map(subcontrol => transform(skinnable, subcontrol, index++));

				textToCopy = subcontrols.join(document.eol)
				vscode.env.clipboard.writeText(textToCopy).then(() => {
					vscode.window.showInformationMessage('Copied to clipboard: ' + textToCopy);
				}, (error) => {
					vscode.window.showErrorMessage('Failed to copy to clipboard: ' + error);
				});
			}
		}
		else {
			vscode.window.showErrorMessage(`"${surroundedText}" doesn't match QSK_STATES(...) declaration!`);
		}
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "qskinny" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('qskinny.helloWorld', function () {
		// vscode.window.showInformationMessage('Hello World from qskinny!');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_states.qsk_states', function () {
		qskStatesToQskState((skinnable, subcontrol, index) => `QSK_STATE( ${skinnable}, ${subcontrol}, QskAspect::FirstUserState << ${index} )`);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_states.qsk_system_state', function () {
		qskStatesToQskState((skinnable, subcontrol, index) => `QSK_STATE( ${skinnable}, ${subcontrol}, QskAspect::FirstSystemState << ${index} )`);
	}));
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
