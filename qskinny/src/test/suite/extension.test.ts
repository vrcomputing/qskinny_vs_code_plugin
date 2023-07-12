import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

// import * as qsk from '../../extension';
import { activate } from '../../extension'; // Replace with your extension activation function

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	setup(async () => {
		await closeAllDocuments();
	});

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Command: qskinny.qsk_subcontrols.qsk_subcontrol without class', async () => {
		const skinnable = 'Q';
		const documentText = 'QSK_SUBCONTROLS(A,B,C)';
		const document = await vscode.workspace.openTextDocument({ language: 'cpp', content: documentText });
		const editor = await vscode.window.showTextDocument(document);
		editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, document.lineAt(0).text.length));
		await vscode.commands.executeCommand('qskinny.qsk_subcontrols.qsk_subcontrol');
		{
			const actualText = await vscode.env.clipboard.readText();
			const expectedText = [
				`QSK_SUBCONTROL( ${skinnable}, A )`,
				`QSK_SUBCONTROL( ${skinnable}, B )`,
				`QSK_SUBCONTROL( ${skinnable}, C )`
			].join(editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
			assert.strictEqual(actualText, expectedText);
		}
	});

	test('Command: qskinny.qsk_subcontrols.qsk_subcontrol with class', async () => {
		const skinnable = 'Skinnable';
		const documentText = [
			`class ${skinnable} : public QskControl`,
			'{',
			'QSK_SUBCONTROLS(A,B,C)',
			'};',
		];
		const document = await vscode.workspace.openTextDocument({ language: 'cpp', content: documentText.join('\n') });
		assert.equal(document.lineCount, documentText.length);
		const editor = await vscode.window.showTextDocument(document);
		const line = documentText.length - 2;
		editor.selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, document.lineAt(line).text.length));
		await vscode.commands.executeCommand('qskinny.qsk_subcontrols.qsk_subcontrol');
		{
			const actualText = await vscode.env.clipboard.readText();
			const expectedText = [
				`QSK_SUBCONTROL( ${skinnable}, A )`,
				`QSK_SUBCONTROL( ${skinnable}, B )`,
				`QSK_SUBCONTROL( ${skinnable}, C )`
			].join(editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
			assert.strictEqual(actualText, expectedText);
		}
	});

	test('Command: qskinny.qsk_states.qsk_state without class', async () => {
		const skinnable = 'Q';
		const documentText = ['QSK_STATES(A,B,C)'];
		const document = await vscode.workspace.openTextDocument({ language: 'cpp', content: documentText.join('\n') });
		const editor = await vscode.window.showTextDocument(document);
		const line = 0;
		editor.selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, document.lineAt(line).text.length));
		await vscode.commands.executeCommand('qskinny.qsk_states.qsk_state');
		{
			const actualText = await vscode.env.clipboard.readText();
			const expectedText = [
				`QSK_STATE( ${skinnable}, A, QskAspect::FirstUserState << 0 )`,
				`QSK_STATE( ${skinnable}, B, QskAspect::FirstUserState << 1 )`,
				`QSK_STATE( ${skinnable}, C, QskAspect::FirstUserState << 2 )`
			].join(editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
			assert.strictEqual(actualText, expectedText);
		}
	});

	test('Command: qskinny.qsk_states.qsk_state with class', async () => {
		const skinnable = 'Skinnable';
		const documentText = [
			`class ${skinnable} : public QskControl`,
			'{',
			'QSK_STATES(A,B,C)',
			'};',
		];
		const document = await vscode.workspace.openTextDocument({ language: 'cpp', content: documentText.join('\n') });
		const editor = await vscode.window.showTextDocument(document);
		const line = 2;
		editor.selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, document.lineAt(line).text.length));
		await vscode.commands.executeCommand('qskinny.qsk_states.qsk_state');
		{
			const actualText = await vscode.env.clipboard.readText();
			const expectedText = [
				`QSK_STATE( ${skinnable}, A, QskAspect::FirstUserState << 0 )`,
				`QSK_STATE( ${skinnable}, B, QskAspect::FirstUserState << 1 )`,
				`QSK_STATE( ${skinnable}, C, QskAspect::FirstUserState << 2 )`
			].join(editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
			assert.strictEqual(actualText, expectedText);
		}
	});

	async function closeAllDocuments() {
		const openedDocuments = vscode.workspace.textDocuments;
		for (const document of openedDocuments) {
			await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		}
	}
});
