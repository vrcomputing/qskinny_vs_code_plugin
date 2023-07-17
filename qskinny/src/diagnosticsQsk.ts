import * as vscode from 'vscode';

function createDiagnosticRange(doc: vscode.TextDocument, range: vscode.Range, token: string): vscode.Diagnostic {
    const diagnostic = new vscode.Diagnostic(range, `Missing ${token}?`, vscode.DiagnosticSeverity.Warning);
    diagnostic.code = token;
    return diagnostic;
}

function findTokenInDocument(document: vscode.TextDocument, token: string): vscode.Range[] {
    const text = document.getText();
    const tokenRegex = new RegExp(token, 'g');
    const ranges: vscode.Range[] = [];

    let match;
    while ((match = tokenRegex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        ranges.push(range);
    }

    return ranges;
}

function sortByStartPosition(lhs: vscode.Range, rhs: vscode.Range): number {
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

export function refreshMissingQGadget(doc: vscode.TextDocument, allDiagnostics: vscode.DiagnosticCollection): void {
    const diagnostics: vscode.Diagnostic[] = [];
    const skinlets: vscode.Range[] = findTokenInDocument(doc, ":.*QskSkinlet");
    const openings: vscode.Range[] = findTokenInDocument(doc, "\{");
    const qgadgets: vscode.Range[] = findTokenInDocument(doc, "Q_GADGET");
    const tokens: vscode.Range[] = skinlets.concat(openings).concat(qgadgets);

    tokens.sort(sortByStartPosition);
    tokens.forEach((range, index) => {
        const s: string = (index + 0 < tokens.length) ? doc.getText(tokens[index + 0]) : '';
        const o: string = (index + 1 < tokens.length) ? doc.getText(tokens[index + 1]) : '';
        const g: string = (index + 2 < tokens.length) ? doc.getText(tokens[index + 2]) : '';
        if (s.indexOf('QskSkinlet') >= 0 && o === '{' && g !== 'Q_GADGET') {
            diagnostics.push(createDiagnosticRange(doc, tokens[index + 1], 'Q_GADGET'));
        }
    });

    allDiagnostics.set(doc.uri, diagnostics);
}

export function refreshMissingQInvokable(doc: vscode.TextDocument, allDiagnostics: vscode.DiagnosticCollection): void {
    const diagnostics: vscode.Diagnostic[] = [];
    const skinlets: vscode.Range[] = findTokenInDocument(doc, "(\\w+)\\s*:.*QskSkinlet.*");
    const constructors: vscode.Range[] = findTokenInDocument(doc, ".*\\(\\s*QskSkin\\s*\\*\\s*[^\\)]*\\)");
    const tokens: vscode.Range[] = skinlets.concat(constructors);

    tokens.sort(sortByStartPosition);
    tokens.forEach((range, index) => {
        const s: string = (index + 0 < tokens.length) ? doc.getText(tokens[index + 0]) : '';
        const c: string = (index + 1 < tokens.length) ? doc.getText(tokens[index + 1]) : '';
        if (s.indexOf('QskSkinlet') >= 0 && c.indexOf('QskSkin') >= 0 && c.indexOf('Q_INVOKABLE') === -1) {
            const lineIndex = tokens[index + 1].start.line;
            const from = new vscode.Position(lineIndex, 0);
            const to = new vscode.Position(lineIndex, doc.lineAt(lineIndex).firstNonWhitespaceCharacterIndex);
            diagnostics.push(createDiagnosticRange(doc, new vscode.Range(from, to), 'Q_INVOKABLE'));
        }
    });

    allDiagnostics.set(doc.uri, diagnostics);
}


export class MissingQInvokableActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        const diagnostics: vscode.Diagnostic[] = context.diagnostics.filter(
            diagnostic => diagnostic.code === 'Q_INVOKABLE'
        );

        const codeActions: vscode.CodeAction[] = diagnostics.map(diagnostic => {
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

export class MissingQGadgetActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {

        const diagnostics: vscode.Diagnostic[] = context.diagnostics.filter(
            diagnostic => diagnostic.code === 'Q_GADGET'
        );

        const codeActions: vscode.CodeAction[] = diagnostics.map(diagnostic => {
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