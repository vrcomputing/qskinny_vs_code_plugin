"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingQGadgetActionProvider = exports.MissingQInvokableActionProvider = exports.refreshMissingQInvokable = exports.refreshMissingQGadget = void 0;
const vscode = require("vscode");
function createDiagnosticRange(doc, range, token) {
    const diagnostic = new vscode.Diagnostic(range, `Missing ${token}?`, vscode.DiagnosticSeverity.Warning);
    diagnostic.code = token;
    return diagnostic;
}
function findTokenInDocument(document, token) {
    const text = document.getText();
    const tokenRegex = new RegExp(token, 'g');
    const ranges = [];
    let match;
    while ((match = tokenRegex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        ranges.push(range);
    }
    return ranges;
}
function sortByStartPosition(lhs, rhs) {
    if (lhs.start.line < rhs.start.line) {
        return -1;
    }
    if (lhs.start.line > rhs.start.line) {
        return +1;
    }
    if (lhs.start.character < rhs.start.character) {
        return -1;
    }
    if (lhs.start.character > rhs.start.character) {
        return +1;
    }
    return 0;
}
function refreshMissingQGadget(doc, allDiagnostics) {
    const diagnostics = [];
    const skinlets = findTokenInDocument(doc, ":.*QskSkinlet");
    const openings = findTokenInDocument(doc, "\{");
    const qgadgets = findTokenInDocument(doc, "Q_GADGET");
    const tokens = skinlets.concat(openings).concat(qgadgets);
    tokens.sort(sortByStartPosition);
    tokens.forEach((range, index) => {
        const s = (index + 0 < tokens.length) ? doc.getText(tokens[index + 0]) : '';
        const o = (index + 1 < tokens.length) ? doc.getText(tokens[index + 1]) : '';
        const g = (index + 2 < tokens.length) ? doc.getText(tokens[index + 2]) : '';
        if (s.indexOf('QskSkinlet') >= 0 && o === '{' && g !== 'Q_GADGET') {
            diagnostics.push(createDiagnosticRange(doc, tokens[index + 1], 'Q_GADGET'));
        }
    });
    allDiagnostics.set(doc.uri, diagnostics);
}
exports.refreshMissingQGadget = refreshMissingQGadget;
function refreshMissingQInvokable(doc, allDiagnostics) {
    const diagnostics = [];
    const skinlets = findTokenInDocument(doc, "(\\w+)\\s*:.*QskSkinlet.*");
    const constructors = findTokenInDocument(doc, ".*\\(\\s*QskSkin\\s*\\*\\s*[^\\)]*\\)");
    const tokens = skinlets.concat(constructors);
    tokens.sort(sortByStartPosition);
    tokens.forEach((range, index) => {
        const s = (index + 0 < tokens.length) ? doc.getText(tokens[index + 0]) : '';
        const c = (index + 1 < tokens.length) ? doc.getText(tokens[index + 1]) : '';
        if (s.indexOf('QskSkinlet') >= 0 && c.indexOf('QskSkin') >= 0 && c.indexOf('Q_INVOKABLE') === -1) {
            const lineIndex = tokens[index + 1].start.line;
            const from = new vscode.Position(lineIndex, 0);
            const to = new vscode.Position(lineIndex, doc.lineAt(lineIndex).firstNonWhitespaceCharacterIndex);
            diagnostics.push(createDiagnosticRange(doc, new vscode.Range(from, to), 'Q_INVOKABLE'));
        }
    });
    allDiagnostics.set(doc.uri, diagnostics);
}
exports.refreshMissingQInvokable = refreshMissingQInvokable;
class MissingQInvokableActionProvider {
    provideCodeActions(document, range, context, token) {
        const diagnostics = context.diagnostics.filter(diagnostic => diagnostic.code === 'Q_INVOKABLE');
        const codeActions = diagnostics.map(diagnostic => {
            const fixAction = new vscode.CodeAction('Insert missing Q_INVOKABLE', vscode.CodeActionKind.QuickFix);
            fixAction.diagnostics = [diagnostic];
            fixAction.isPreferred = true;
            fixAction.edit = new vscode.WorkspaceEdit();
            fixAction.edit.insert(document.uri, range.end, 'Q_INVOKABLE ');
            return fixAction;
        });
        return codeActions;
    }
}
exports.MissingQInvokableActionProvider = MissingQInvokableActionProvider;
MissingQInvokableActionProvider.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
];
class MissingQGadgetActionProvider {
    provideCodeActions(document, range, context, token) {
        const diagnostics = context.diagnostics.filter(diagnostic => diagnostic.code === 'Q_GADGET');
        const codeActions = diagnostics.map(diagnostic => {
            const fixAction = new vscode.CodeAction('Insert missing Q_GADGET', vscode.CodeActionKind.QuickFix);
            fixAction.diagnostics = [diagnostic];
            fixAction.isPreferred = true;
            fixAction.edit = new vscode.WorkspaceEdit();
            fixAction.edit.insert(document.uri, range.end.translate(0, 1), 'Q_GADGET');
            return fixAction;
        });
        return codeActions;
    }
}
exports.MissingQGadgetActionProvider = MissingQGadgetActionProvider;
MissingQGadgetActionProvider.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
];
//# sourceMappingURL=diagnosticsQsk.js.map