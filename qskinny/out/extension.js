"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const diagnostics_1 = require("./diagnostics");
const qsk = require("./diagnosticsQsk");
class CppMacro {
    constructor(name, parameters) {
        this.name = name;
        this.parameters = parameters;
    }
}
class CppEnumeration {
    constructor(name, enumerators) {
        this.name = name;
        this.enumerators = enumerators;
    }
}
/**
 * @param name Pattern of the macros's name
 * @param line The line as string to seach for the macro
 * @returns Returns an instance of a CppMacro
 */
function qskMacroParameters(name, line) {
    const regex = new RegExp(`^(${name})\\s*\\((.*)\\)$`);
    const match = line.match(regex);
    if (!match) {
        return null;
    }
    const macro = new CppMacro(match[1].trim(), match[2].split(',').map(s => s.trim()).filter(s => s.match(/\w+/)));
    return macro;
}
/**
 * @param line The line number in the active document
 * @param fallback The name to return if the search fails
 * @returns Returns the first class or struct's name declared before @p line
 */
function qskFindClassnameBeforeLine(line, document, fallback = 'Q') {
    if (!document) {
        return fallback;
    }
    let skinnable = fallback;
    // find candidate for the class name
    for (let lineNumber = line - 1; lineNumber >= 0; lineNumber--) {
        const lineText = document.lineAt(lineNumber).text;
        const match = lineText.match(/.*(?:class|struct).*\s+(\w+)\s*:.*/);
        if (match) {
            skinnable = match[1].trim();
            return skinnable;
        }
    }
    return fallback;
}
function qskNodeRoleTransformation(transform) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        const range = new vscode.Range(selection.start, selection.end);
        const selectedLines = [];
        for (let lineNumber = selection.start.line; lineNumber <= selection.end.line; lineNumber++) {
            const lineText = editor.document.lineAt(lineNumber).text;
            selectedLines.push(lineText);
        }
        const line = selectedLines.join('');
        const match = line.match(/enum\s+(\w+)\s*\{(.*)\}/);
        if (match) {
            const name = match[1];
            const enumerators = match[2].split(',').map(s => s.trim().split('=')[0].trim()).filter(s => s.length > 0);
            const enumeration = new CppEnumeration(name, enumerators);
            let skinlet = qskFindClassnameBeforeLine(selection.start.line, editor.document, 'Q');
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
function qskMacroTransformation(macroname, transform) {
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
            const skinnable = qskFindClassnameBeforeLine(selection.start.line, editor.document, 'Q');
            const lines = transform(skinnable, macro);
            if (lines.length > 0) {
                const textToCopy = lines.join(document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
                vscode.env.clipboard.writeText(textToCopy).then(() => {
                    vscode.window.showInformationMessage('Copied to clipboard: ' + textToCopy);
                }, (error) => {
                    vscode.window.showErrorMessage('Failed to copy to clipboard: ' + error);
                });
            }
        }
        else {
            vscode.window.showErrorMessage(`Invalid "${macroname}" declaration!`);
        }
    }
}
function activate(context) {
    console.log('Congratulations, your extension "qskinny" is now active!');
    // diagnostics
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, new qsk.MissingQGadgetActionProvider));
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, new qsk.MissingQInvokableActionProvider));
    const missingQGadgetCollection = vscode.languages.createDiagnosticCollection('Missing Q_GADGET');
    context.subscriptions.push(missingQGadgetCollection);
    const missingQInvokableCollection = vscode.languages.createDiagnosticCollection('Missing Q_INVOKABLE');
    context.subscriptions.push(missingQInvokableCollection);
    (0, diagnostics_1.subscribeToDocumentChanges)(context, missingQGadgetCollection, qsk.refreshMissingQGadget);
    (0, diagnostics_1.subscribeToDocumentChanges)(context, missingQInvokableCollection, qsk.refreshMissingQInvokable);
    // qsk subcontrol transformations
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.subcontrols.subcontrol', () => {
        qskMacroTransformation('QSK_SUBCONTROLS', (skinnable, macro) => macro.parameters.map(subcontrol => `QSK_SUBCONTROL( ${skinnable}, ${subcontrol} )`));
    }));
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.subcontrols.subcontrol.if', () => {
        let index = 0;
        qskMacroTransformation('QSK_SUBCONTROLS', (skinnable, macro) => macro.parameters.map(subcontrol => (index++ > 0 ? 'else ' : '') + `if ( subControl == ${skinnable}::${subcontrol} )\n{\n}`));
    }));
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.subcontrols.noderoles', () => {
        qskMacroTransformation('QSK_SUBCONTROLS', (skinnable, macro) => {
            return ['enum NodeRole', '{']
                .concat(macro.parameters.map(subcontrol => `\t${subcontrol},`))
                .concat(['\tRoleCount', '};']);
        });
    }));
    // qsk states transformations
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.states.state', () => {
        let index = 0;
        qskMacroTransformation('QSK_STATES', (skinnable, macro) => macro.parameters.map(subcontrol => `QSK_STATE( ${skinnable}, ${subcontrol}, QskAspect::FirstUserState << ${index++} )`));
    }));
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.states.systemstate', () => {
        let index = 0;
        qskMacroTransformation('QSK_STATES', (skinnable, macro) => macro.parameters.map(subcontrol => `QSK_SYSTEM_STATE( ${skinnable}, ${subcontrol}, QskAspect::FirstSystemState << ${index++} )`));
    }));
    // enum transformations 
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.noderoles.switch', () => {
        qskNodeRoleTransformation((skinlet, enumeration) => [`switch(static_cast<${skinlet}::${enumeration.name}>(role))`, '{']
            .concat(enumeration.enumerators.map(role => `\tcase ${skinlet}::${enumeration.name}::${role}:\n\t\tbreak;`)
            .concat(['\tdefault:', '\t\tbreak;'])
            .concat(['}'])));
    }));
    // enum advanced commands
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.noderoles.template.subcontrol', () => {
        if (!vscode.workspace.getConfiguration('qskinny').get('advancedCommands')) {
            vscode.window.showWarningMessage("Advanced commands not activated! See: 'qskinny.advancedCommands: true'");
            return;
        }
        qskNodeRoleTransformation((skinlet, enumeration) => [
            `// TODO move to .h file`,
            `template<${skinlet}::${enumeration.name}>`,
            `QSGNode* updateSubNode( const QskSkinnable* skinnable, QSGNode* node) const;`,
            ``,
            `// TODO move to .cpp file`,
            `template<${enumeration.name}>`,
            `QSGNode* ${skinlet}::updateSubNode( const QskSkinnable* skinnable, QSGNode* node) const = delete;`,
            ``
        ].concat(enumeration.enumerators.map(role => `template<>\nQSGNode* ${skinlet}::updateSubNode<${skinlet}::${enumeration.name}::${role}>( const QskSkinnable* const skinnable, QSGNode* node) const\n{\n}\n`)));
    }));
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.noderoles.template.switch', () => {
        if (!vscode.workspace.getConfiguration('qskinny').get('advancedCommands')) {
            vscode.window.showWarningMessage("Advanced commands not activated! See: 'qskinny.advancedCommands: true'");
            return;
        }
        qskNodeRoleTransformation((skinlet, enumeration) => [
            `QSGNode* ${skinlet}::updateSubNode( const QskSkinnable* const skinnable, const quint8 role, QSGNode* const node ) const override;`,
            `{`,
            `\tusing R = ${skinlet}::${enumeration.name};`,
            `\tswitch( static_cast< ${skinlet}::${enumeration.name} >( role ) )`,
            `\t{`
        ]
            .concat(enumeration.enumerators.map(role => `\t\tcase R::${role}: return updateSubNode<R::${role}>(skinnable, node);`))
            .concat([`\t\tdefault: return Inherited::updateSubNode(skinnable, role, node);`, `\t}`, `}`]));
    }));
    // tutorials
    context.subscriptions.push(vscode.commands.registerCommand('qskinny.noderoles.template.tutorial', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders?.length <= 0) {
            vscode.window.showErrorMessage('No active workspace found');
            return;
        }
        const workspaceFolder = workspaceFolders[0].uri;
        const titles = [
            "Step 1/4: Create skinnable's header file",
            "Step 2/4: Create skinnable's source file",
            "Step 3/4: Create skinlets's header file",
            "Step 4/4: Create skinlets's source file"
        ];
        vscode.window.showInputBox({ title: titles[0], prompt: 'Enter skinnable name', placeHolder: 'e.g. ExampleControl', value: 'ExampleControl', validateInput: text => (text.match(/\w+/) ? "" : 'Must not be empty (a-zA-Z_)!') }).then(skinnable => {
            const skinnableHpp = vscode.Uri.file(`${workspaceFolder.fsPath}/${skinnable}.h`);
            const skinnableCpp = vscode.Uri.file(`${workspaceFolder.fsPath}/${skinnable}.cpp`);
            const skinletHpp = vscode.Uri.file(`${workspaceFolder.fsPath}/${skinnable}Skinlet.h`);
            const skinletCpp = vscode.Uri.file(`${workspaceFolder.fsPath}/${skinnable}Skinlet.cpp`);
            vscode.workspace.openTextDocument(skinnableHpp.with({ scheme: 'untitled' })).then(doc => {
                vscode.window.showTextDocument(doc).then(editor => {
                    const lines = [
                        '#pragma once',
                        '',
                        '#include <QskControl.h>',
                        '',
                        'class ${1:' + skinnable + '} : public QskControl',
                        '{',
                        '\texplicit ${1:' + skinnable + '}( QQuickItem* parent = nullptr );',
                        '};',
                    ];
                    const snippet = new vscode.SnippetString(lines.join(doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n'));
                    editor.insertSnippet(snippet, new vscode.Position(0, 0));
                    vscode.workspace.onDidSaveTextDocument((savedDocument) => {
                        if (savedDocument.uri.toString() === skinnableHpp.toString()) {
                            vscode.window.showInformationMessage(`Completed ${titles[0]}`);
                            vscode.workspace.openTextDocument(skinnableCpp.with({ scheme: 'untitled' })).then(doc => {
                                vscode.window.showTextDocument(doc).then(editor => {
                                    const lines = [
                                        '#include "${1:' + skinnable + '}.h"',
                                        '',
                                        '${1:' + skinnable + '}::${1:' + skinnable + '}( QQuickItem* const parent) : QskControl( parent )',
                                        '{',
                                        '}',
                                        '',
                                        '#include "moc_${1:' + skinnable + '}.cpp"',
                                    ];
                                    const snippet = new vscode.SnippetString(lines.join(doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n'));
                                    editor.insertSnippet(snippet, new vscode.Position(0, 0));
                                    vscode.workspace.onDidSaveTextDocument((savedDocument) => {
                                        if (savedDocument.uri.toString() === skinnableCpp.toString()) {
                                            vscode.window.showInformationMessage(`Completed ${titles[1]}`);
                                            vscode.workspace.openTextDocument(skinletHpp.with({ scheme: 'untitled' })).then(doc => {
                                                vscode.window.showTextDocument(doc).then(editor => {
                                                    const lines = [
                                                        '#pragma once',
                                                        'class ${1:' + skinnable + '}Skinlet : public QskSkinlet',
                                                        '{',
                                                        '\tQ_GADGET',
                                                        'public:',
                                                        '\tenum NodeRole',
                                                        '\t{',
                                                        '\t\tRoleCount',
                                                        '\t};',
                                                        '',
                                                        '\tQ_INVOKABLE ${1:' + skinnable + '}Skinlet( QskSkin* skin = nullptr );',
                                                        '};',
                                                    ];
                                                    const snippet = new vscode.SnippetString(lines.join(doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n'));
                                                    editor.insertSnippet(snippet, new vscode.Position(0, 0));
                                                    vscode.workspace.onDidSaveTextDocument((savedDocument) => {
                                                        if (savedDocument.uri.toString() === skinletHpp.toString()) {
                                                            vscode.window.showInformationMessage(`Completed ${titles[2]}`);
                                                            vscode.workspace.openTextDocument(skinletCpp.with({ scheme: 'untitled' })).then(doc => {
                                                                vscode.window.showTextDocument(doc).then(editor => {
                                                                    const lines = [
                                                                        '#include "${1:' + skinnable + '}Skinlet.h"',
                                                                        ``,
                                                                        '${1:' + skinnable + '}Skinlet( QskSkin* const skin = nullptr ) : QskSkinlet( skin )',
                                                                        `{`,
                                                                        `}`
                                                                    ];
                                                                    const snippet = new vscode.SnippetString(lines.join(doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n'));
                                                                    editor.insertSnippet(snippet, new vscode.Position(0, 0));
                                                                    vscode.workspace.onDidSaveTextDocument((savedDocument) => {
                                                                        if (savedDocument.uri.toString() === skinletCpp.toString()) {
                                                                            vscode.window.showInformationMessage(`Completed ${titles[3]}`);
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        }
                                                    });
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    });
                });
            }, err => vscode.window.showErrorMessage(`Failed to open "${skinnableHpp.fsPath}": ${err}`));
        });
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map