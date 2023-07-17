import * as vscode from 'vscode';

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, diagnostics: vscode.DiagnosticCollection, refreshDiagnostics: (doc: vscode.TextDocument, diagnostics: vscode.DiagnosticCollection) => void): void {
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document, diagnostics);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                refreshDiagnostics(editor.document, diagnostics);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, diagnostics))
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => diagnostics.delete(doc.uri))
    );
}