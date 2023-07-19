# QSkinny VS Code Extension

> The (Q)Skinny library is a framework built on top of the Qt scene graph and very few core classes from Qt/Quick. It offers a set of lightweight controls, that can be used from C++ and/or QML.
>
> -- <cite>[QSkinny Repository](https://github.com/uwerat/qskinny)</cite>

This extension provides usefull commands to accelerate QSkinny / C++ code generation

# Features
- Transforming `QSK_SUBCONTROLS` or `QSK_STATES` declarations into initializations

|QSK_SUBCONTROLS|QSK_STATES|
|-|-|
|![](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.subcontrols.subcontrol.gif)|![](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.states.state.gif)|

- Transforming `QSK_SUBCONTROLS` declarations into sequences of if/switch statements
- Simple static code analysis for e.g. missing `Q_INVOKABLE` macro in skinlet declarations

![](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.missing.qinvokable.quickfix.gif)

# Commands

## QSK: QSK_SUBCONTROLS(...) => QSK_SUBCONTROL(..., ...)

Transforms a `QSK_SUBCONTROLS`(...) selection into a sequence of `QSK_SUBCONTROL`(..., ...) initializations (one per ` subcontrol`)

__Input__

```cpp
QSK_SUBCONTROLS( Overlay, Panel, Segment, Cursor, Text, Icon, Separator )
```

__Output__

```cpp
QSK_SUBCONTROL( Skinnable, Overlay )
QSK_SUBCONTROL( Skinnable, Panel )
QSK_SUBCONTROL( Skinnable, Segment )
QSK_SUBCONTROL( Skinnable, Cursor )
QSK_SUBCONTROL( Skinnable, Text )
QSK_SUBCONTROL( Skinnable, Icon )
QSK_SUBCONTROL( Skinnable, Separator )
```

![./doc/qskinny.subcontrols.subcontrol](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.subcontrols.subcontrol.gif)

## QSK: QSK_SUBCONTROLS(...) => if( subControl == ...)

Transforms a `QSK_SUBCONTROLS`(...) selection into a sequence of empty (else)if statements (one per ` subcontrol`)

__Input__

```cpp
QSK_SUBCONTROLS( Overlay, Panel, Segment, Cursor, Text, Icon, Separator )
```

__Output__

```cpp
if ( subControl == Q::Overlay )
{
}
else if ( subControl == Q::Panel )
{
}
else if ( subControl == Q::Segment )
{
}
else if ( subControl == Q::Cursor )
{
}
else if ( subControl == Q::Text )
{
}
else if ( subControl == Q::Icon )
{
}
else if ( subControl == Q::Separator )
{
}
```

![./doc/qskinny.subcontrols.subcontrol.if](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.subcontrols.subcontrol.if.gif)

## QSK: QSK_SUBCONTROLS(...) => enum NodeRole { ... }

Transforms a `QSK_SUBCONTROLS`(...) selection into a node roles enum declaration (one enumerator per ` subcontrol`)

__Input__

```cpp
QSK_SUBCONTROLS( Overlay, Panel, Segment, Cursor, Text, Icon, Separator )
```

__Output__

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
	RoleCount
};
```

![./doc/qskinny.subcontrols.noderoles](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.subcontrols.noderoles.gif)

## QSK: QSK_STATES(...) => QSK_STATE(..., ..., ...)

Transforms a `QSK_STATES`(...) selection into a sequence of `QSK_STATE`(..., ..., `QskAspect::FirstUserState` << ...) initializations (one per ` subcontrol`)

__Input__

```cpp
QSK_STATES( Checked, Pressed )
```

__Output__

```cpp
QSK_STATE( Skinnable, Checked, QskAspect::FirstUserState << 0 )
QSK_STATE( Skinnable, Pressed, QskAspect::FirstUserState << 1 )
```

![./doc/qskinny.states.state](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.states.state.gif)

## QSK: QSK_STATES(...) => QSK_SYSTEM_STATE(..., ..., ...)

Transforms a `QSK_STATES`(...) selection into a sequence of `QSK_STATE`(..., ..., `QskAspect::FirstSystemState` << ...) initializations (one per ` subcontrol`)

__Input__

```cpp
QSK_STATES( Checked, Pressed )
```

__Output__

```cpp
QSK_SYSTEM_STATE( Skinnable, Checked, QskAspect::FirstSystemState << 0 )
QSK_SYSTEM_STATE( Skinnable, Pressed, QskAspect::FirstSystemState << 1 )
```

![./doc/qskinny.states.systemstate](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.states.systemstate.gif)

## QSK: enum NodeRole => switch(...)

Transforms an enumeration selection into a `switch` statement (one `case` per ` subcontrol`)

__Input__

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

__Output__

```cpp
switch(static_cast<Q::NodeRole>(role))
{
	case Q::NodeRole::Overlay:
		break;
	case Q::NodeRole::Panel:
		break;
	case Q::NodeRole::Segment:
		break;
	case Q::NodeRole::Cursor:
		break;
	case Q::NodeRole::Text:
		break;
	case Q::NodeRole::Icon:
		break;
	case Q::NodeRole::Separator:
		break;
	default:
		break;
}
```

![./doc/qskinny.noderoles.switch](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.noderoles.switch.gif)

## QSK: enum NodeRole => template<NodeRole>

(Advanced Command) Creates empty `updateSubNode`<NodeRole> function for each node role

__Input__

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

__Output__

```cpp
// TODO move to .h file
template<Q::NodeRole>
QSGNode* updateSubNode( const QskSkinnable* skinnable, QSGNode* node) const;

// TODO move to .cpp file
template<NodeRole>
QSGNode* Q::updateSubNode( const QskSkinnable* skinnable, QSGNode* node) const = delete;

template<>
QSGNode* Q::updateSubNode<Q::NodeRole::Overlay>( const QskSkinnable* const skinnable, QSGNode* node) const
{
}

template<>
QSGNode* Q::updateSubNode<Q::NodeRole::Panel>( const QskSkinnable* const skinnable, QSGNode* node) const
{
}

template<>
QSGNode* Q::updateSubNode<Q::NodeRole::Segment>( const QskSkinnable* const skinnable, QSGNode* node) const
{
}

template<>
QSGNode* Q::updateSubNode<Q::NodeRole::Cursor>( const QskSkinnable* const skinnable, QSGNode* node) const
{
}

template<>
QSGNode* Q::updateSubNode<Q::NodeRole::Text>( const QskSkinnable* const skinnable, QSGNode* node) const
{
}

template<>
QSGNode* Q::updateSubNode<Q::NodeRole::Icon>( const QskSkinnable* const skinnable, QSGNode* node) const
{
}

template<>
QSGNode* Q::updateSubNode<Q::NodeRole::Separator>( const QskSkinnable* const skinnable, QSGNode* node) const
{
}
```

![./doc/qskinny.noderoles.template.subcontrol](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.noderoles.template.subcontrol.gif)

## QSK: enum NodeRole => switch(...) template<NodeRole>

(Advanced Command) Creates a `switch` `case` statement returning `updateSubNode`<NodeRole> for each node role

__Input__

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

__Output__

```cpp
QSGNode* Q::updateSubNode( const QskSkinnable* const skinnable, const quint8 role, QSGNode* const node ) const override;
{
	using R = Q::NodeRole;
	switch( static_cast< Q::NodeRole >( role ) )
	{
		case R::Overlay: return updateSubNode<R::Overlay>(skinnable, node);
		case R::Panel: return updateSubNode<R::Panel>(skinnable, node);
		case R::Segment: return updateSubNode<R::Segment>(skinnable, node);
		case R::Cursor: return updateSubNode<R::Cursor>(skinnable, node);
		case R::Text: return updateSubNode<R::Text>(skinnable, node);
		case R::Icon: return updateSubNode<R::Icon>(skinnable, node);
		case R::Separator: return updateSubNode<R::Separator>(skinnable, node);
		default: return Inherited::updateSubNode(skinnable, role, node);
	}
}
```

![./doc/qskinny.noderoles.template.switch](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.noderoles.template.switch.gif)

## QSK: Skinnable + Skinlet

Semi-interactive command that creates a `skinnable` and ` skinlet` template

__Input__

```cpp

```

__Output__

```cpp

```

![./doc/qskinny.noderoles.template.tutorial](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc/qskinny.noderoles.template.tutorial.gif)

# Extension Settings

|ID|Type|Default|Description|
|-|-|-|-|
|qskinny.advancedCommands|boolean|False|Enable advanced commands|

# Snippets

[./scripts/template.json](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/snippets/template.json)

## Insert 'QskSkinnable' declaration

Inserts a QSkinny template declaration of a simple control with a colored background and text subcontrol.
See: [./scripts/template.json](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/snippets/template.json)

__Usage:__ Type one of the following prefixes: `QSK: Skinnable Declaration`

## Insert 'QskSkinnable' implementation

Inserts a QSkinny template implementation of a simple control with a colored background and text subcontrol.
See: [./scripts/template.json](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/snippets/template.json)

__Usage:__ Type one of the following prefixes: `QSK: Skinnable Implementation`

## Insert 'QskSkinlet' declaration

Inserts a QSkinny template declaration of a simple skinlet with a colored background and text subcontrol.
See: [./scripts/template.json](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/snippets/template.json)

__Usage:__ Type one of the following prefixes: `QSK: Skinlet Declaration`

## Insert 'QskSkinlet' implementation

Inserts a QSkinny template implementation of a simple skinlet with a colored background and text subcontrol.
See: [./scripts/template.json](https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/snippets/template.json)

__Usage:__ Type one of the following prefixes: `QSK: Skinlet Implementation`

