// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function qskStatesToQskState() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const selection = editor.selection;
		const range = new vscode.Range(selection.start, selection.end);
		const surroundedText = editor.document.getText(range);
		const document = editor.document;

		const regex = /QSK_STATES\s*\((.*)\)/;
		const match = surroundedText.match(regex);
		
		// if surrounded text matches QSK_STATES declaration
		if (match) {

			// TODO optionally show the user an input
			let skinnable = 'Q'

			// find candidate for the class name
			for (let lineNumber = selection.start.line - 1; lineNumber > 0; lineNumber--) {
				const lineText = document.lineAt(lineNumber).text;
				let match = lineText.match(/(?:class|struct).*\s+(\w+)\s*:/)
				if(match)
				{
					skinnable = match[1].trim();
					break;
				}
			}

			let i = 0;
			let subcontrols = match[1].split(',').map(s => s.trim())
			subcontrols = subcontrols.map(s => `QSK_STATE( ${skinnable}, ${s}, QskAspect::FirstUserState << ${i++} )`)

			// if subcontrols list is not empty
			if (i > 0) {
				textToCopy = subcontrols.join('\n')
				vscode.env.clipboard.writeText(textToCopy).then(() => {
					vscode.window.showInformationMessage('Copied to clipboard: ' + textToCopy);
				}, (error) => {
					vscode.window.showErrorMessage('Failed to copy to clipboard: ' + error);
				});
			}
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
	context.subscriptions.push(vscode.commands.registerCommand('qskinny.qsk_states', function () {
		// vscode.window.showInformationMessage('Hello World from qskinny!');
		qskStatesToQskState();
	}));
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
