"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    setup(async () => {
        await closeAllDocuments();
    });
    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
    test('Command: "qskinny.subcontrols.subcontrol" fallback', async () => {
        const skinnable = 'Q';
        const documentText = 'QSK_SUBCONTROLS(A,B,C)';
        const document = await vscode.workspace.openTextDocument({ language: 'cpp', content: documentText });
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, document.lineAt(0).text.length));
        await vscode.commands.executeCommand('qskinny.subcontrols.subcontrol');
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
    test('Command: "qskinny.subcontrols.subcontrol"', async () => {
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
        await vscode.commands.executeCommand('qskinny.subcontrols.subcontrol');
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
    test('Command: "qskinny.subcontrols.subcontrol.if"', async () => {
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
        await vscode.commands.executeCommand('qskinny.subcontrols.subcontrol.if');
        {
            const actualText = await vscode.env.clipboard.readText();
            const expectedText = [
                `if ( subControl == ${skinnable}::A )`,
                `{`,
                `}`,
                `else if ( subControl == ${skinnable}::B )`,
                `{`,
                `}`,
                `else if ( subControl == ${skinnable}::C )`,
                `{`,
                `}`,
            ].join(editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
            assert.strictEqual(actualText, expectedText);
        }
    });
    test('Command: "qskinny.subcontrols.noderoles"', async () => {
        const skinnable = 'Skinnable';
        const documentText = [
            `class ${skinnable} : public QskControl`,
            '{',
            'QSK_SUBCONTROLS(A,B,C)',
            '};',
        ];
        const expectedText = [
            `enum NodeRole`,
            `{`,
            `\tA,`,
            `\tB,`,
            `\tC,`,
            `\tRoleCount`,
            `};`,
        ].join('\n');
        const line = documentText.length - 2;
        const selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, documentText[line].length));
        await setupDocumentSelection(documentText, selection);
        await vscode.commands.executeCommand('qskinny.subcontrols.noderoles');
        const actualText = await vscode.env.clipboard.readText();
        assert.strictEqual(actualText, expectedText);
    });
    test('Command: "qskinny.states.state" fallback', async () => {
        const skinnable = 'Q';
        const documentText = ['QSK_STATES(A,B,C)'];
        const document = await vscode.workspace.openTextDocument({ language: 'cpp', content: documentText.join('\n') });
        const editor = await vscode.window.showTextDocument(document);
        const line = 0;
        editor.selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, document.lineAt(line).text.length));
        await vscode.commands.executeCommand('qskinny.states.state');
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
    test('Command: "qskinny.states.state"', async () => {
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
        await vscode.commands.executeCommand('qskinny.states.state');
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
    test('Command: "qskinny.states.systemstate"', async () => {
        const skinnable = 'Skinnable';
        const documentText = [
            `class ${skinnable} : public QskControl`,
            '{',
            'QSK_STATES(A,B,C)',
            '};',
        ];
        const expectedText = [
            `QSK_SYSTEM_STATE( ${skinnable}, A, QskAspect::FirstSystemState << 0 )`,
            `QSK_SYSTEM_STATE( ${skinnable}, B, QskAspect::FirstSystemState << 1 )`,
            `QSK_SYSTEM_STATE( ${skinnable}, C, QskAspect::FirstSystemState << 2 )`
        ].join('\n');
        const line = 2;
        const selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, documentText[line].length));
        await setupDocumentSelection(documentText, selection);
        await vscode.commands.executeCommand('qskinny.states.systemstate');
        const actualText = await vscode.env.clipboard.readText();
        assert.strictEqual(actualText, expectedText);
    });
    test('Command: "qskinny.noderoles.switch"', async () => {
        const skinlet = 'Skinlet';
        const enumeration = 'NodeRole';
        const documentText = [
            `class ${skinlet} : public QskSkinlet`,
            '{',
            'enum NodeRole',
            '{',
            'A,',
            'B,',
            'C,',
            '};',
            '};',
        ];
        const expectedText = [
            `switch(static_cast<${skinlet}::${enumeration}>(role))`,
            `{`,
            `\tcase ${skinlet}::${enumeration}::A:`,
            `\t\tbreak;`,
            `\tcase ${skinlet}::${enumeration}::B:`,
            `\t\tbreak;`,
            `\tcase ${skinlet}::${enumeration}::C:`,
            `\t\tbreak;`,
            `\tdefault:`,
            `\t\tbreak;`,
            `}`
        ].join('\n');
        const selection = new vscode.Selection(new vscode.Position(2, 0), new vscode.Position(7, documentText[7].length));
        await setupDocumentSelection(documentText, selection);
        await vscode.commands.executeCommand('qskinny.noderoles.switch');
        const actualText = await vscode.env.clipboard.readText();
        assert.strictEqual(actualText, expectedText);
    });
    async function setupDocumentSelection(documentText, selection) {
        const document = await vscode.workspace.openTextDocument({ language: 'cpp', content: documentText.join('\n') });
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = selection;
    }
    async function closeAllDocuments() {
        const openedDocuments = vscode.workspace.textDocuments;
        for (const document of openedDocuments) {
            await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        }
    }
});
//# sourceMappingURL=extension.test.js.map