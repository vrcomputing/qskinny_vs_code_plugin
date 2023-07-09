# qskinny README

This is the README for your extension "qskinny". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Commands

### QSK: QSK_SUBCONTROLS(...) - Input

```cpp
QSK_SUBCONTROLS( Overlay, Panel, Segment, Cursor, Text, Icon, Separator )
```

### QSK: QSK_SUBCONTROLS(...) => QSK_SUBCONTROL(..., ...) - Output

```cpp
QSK_SUBCONTROL( QskMenu, Overlay )
QSK_SUBCONTROL( QskMenu, Panel )
QSK_SUBCONTROL( QskMenu, Segment )
QSK_SUBCONTROL( QskMenu, Cursor )
QSK_SUBCONTROL( QskMenu, Text )
QSK_SUBCONTROL( QskMenu, Icon )
QSK_SUBCONTROL( QskMenu, Separator )
```

### QSK: QSK_SUBCONTROLS(...) => if( subControl == ...) - Output

```cpp
if ( subControl == QskMenu::Overlay ){}
else if ( subControl == QskMenu::Panel ){}
else if ( subControl == QskMenu::Segment ){}
else if ( subControl == QskMenu::Cursor ){}
else if ( subControl == QskMenu::Text ){}
else if ( subControl == QskMenu::Icon ){}
else if ( subControl == QskMenu::Separator ){}
```

### QSK: QSK_SUBCONTROLS(...) => enum NodeRole { ... }

```cpp
enum NodeRole
{
	Overlay,
	Panel,
	Segment,
	Cursor,
	Text,
	Icon,
	Separator,
};
```

### QSK: QSK_STATES(...) - Input

```cpp
QSK_STATES( Checked, Pressed )
```

### QSK: QSK_STATES(...) => QSK_STATE(..., ..., ...) - Output

```cpp
QSK_STATE( QskAbstractButton, Checked, QskAspect::FirstUserState << 0 )
QSK_STATE( QskAbstractButton, Pressed, QskAspect::FirstUserState << 1 )
```

### QSK: QSK_STATES(...) => QSK_SYSTEM_STATE(..., ..., ...) - Output

```cpp
QSK_SYSTEM_STATE( QskAbstractButton, Checked, QskAspect::FirstSystemState << 0 )
QSK_SYSTEM_STATE( QskAbstractButton, Pressed, QskAspect::FirstSystemState << 0 )
```

### QSK: enum NodeRole - Input

```cpp
enum NodeRole
{
    PanelRole,
    SplashRole,
    TextRole,
    IconRole,
    RoleCount
};
```

### QSK: enum NodeRole => template<NodeRole> - Output

```cpp
// TODO move to .h file
template<NodeRole>
Q_REQUIRED_RESULT QSGNode* updateSubNode( const QskSkinnable* skinnable, QSGNode* node) const;

// TODO move to .cpp file
template<NodeRole>
QSGNode* QskPushButtonSkinlet::updateSubNode( const QskSkinnable* skinnable, QSGNode* node) const = delete;

template<>
QSGNode* QskPushButtonSkinlet::updateSubNode<QskPushButtonSkinlet::NodeRole::PanelRole>( const QskSkinnable* skinnable, QSGNode* node) const{}

template<>
QSGNode* QskPushButtonSkinlet::updateSubNode<QskPushButtonSkinlet::NodeRole::SplashRole>( const QskSkinnable* skinnable, QSGNode* node) const{}

template<>
QSGNode* QskPushButtonSkinlet::updateSubNode<QskPushButtonSkinlet::NodeRole::TextRole>( const QskSkinnable* skinnable, QSGNode* node) const{}

template<>
QSGNode* QskPushButtonSkinlet::updateSubNode<QskPushButtonSkinlet::NodeRole::IconRole>( const QskSkinnable* skinnable, QSGNode* node) const{}

template<>
QSGNode* QskPushButtonSkinlet::updateSubNode<QskPushButtonSkinlet::NodeRole::RoleCount>( const QskSkinnable* skinnable, QSGNode* node) const{}

```

### QSK: enum NodeRole => switch(...) template<NodeRole> - Output

```cpp
QSGNode* QskPushButtonSkinlet::updateSubNode( const QskSkinnable* const skinnable, const quint8 role, QSGNode* const node ) const override;
{
	using R = QskPushButtonSkinlet::NodeRole;
	switch( static_cast< QskPushButtonSkinlet::NodeRole >( role ) )
	{
		case R::PanelRole: return updateSubNode<R::PanelRole>(skinnable, node);
		case R::SplashRole: return updateSubNode<R::SplashRole>(skinnable, node);
		case R::TextRole: return updateSubNode<R::TextRole>(skinnable, node);
		case R::IconRole: return updateSubNode<R::IconRole>(skinnable, node);
		case R::RoleCount: return updateSubNode<R::RoleCount>(skinnable, node);
		default: return Inherited::updateSubNode(skinnable, role, node);
	}
}
```

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
