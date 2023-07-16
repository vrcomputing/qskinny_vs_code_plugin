import json
import re
import os

print(os.getcwd())

def highlightTokens(text : str):
    text = re.sub(r'(QSK_SUBCONTROL[S]?)', r'`\1`', text)
    text = re.sub(r'(QSK_STATE[S]?)', r'`\1`', text)
    text = re.sub(r'(QskAspect::FirstUserState)', r'`\1`', text)
    text = re.sub(r'(QskAspect::FirstSystemState)', r'`\1`', text)
    text = re.sub(r'(switch)', r'`\1`', text)
    text = re.sub(r'(case)', r'`\1`', text)
    text = re.sub(r'(updateSubNode)', r'`\1`', text)
    text = re.sub(r'(skinnable)', r'`\1`', text, flags=re.IGNORECASE)
    text = re.sub(r'( skinlet)', r' `\1`', text, flags=re.IGNORECASE)
    text = re.sub(r'( subcontrol)', r' `\1`', text, flags=re.IGNORECASE)
    return text

gifroot = "https://github.com/vrcomputing/qskinny_vs_code_plugin/raw/main/qskinny/doc"
txtroot= f"{os.getcwd()}/qskinny/doc".replace("\\", "/")

with open(f"{os.getcwd()}/qskinny/package.json", "r") as input:
    content = json.load(input)
    with open(f"{os.getcwd()}/qskinny/ReadMe.md", "w") as md:
        md.write(f"# {content['displayName']} VS Code Extension\n")
        md.write(f"\n")
        md.write("> The (Q)Skinny library is a framework built on top of the Qt scene graph and very few core classes from Qt/Quick. It offers a set of lightweight controls, that can be used from C++ and/or QML.\n")
        md.write(">\n")
        md.write("> -- <cite>[QSkinny Repository](https://github.com/uwerat/qskinny)</cite>\n")
        md.write(f"\n")
        md.write(f"{content['description']}\n")
        md.write(f"\n")
        md.write(f"# Features\n")
        md.write(f"- Transforming `QSK_SUBCONTROLS` or `QSK_STATES` declarations into initializations\n")
        md.write(f"\n")
        md.write(f"|QSK_SUBCONTROLS|QSK_STATES|\n")
        md.write(f"|-|-|\n")
        md.write(f"|![]({gifroot}/qskinny.subcontrols.subcontrol.gif)|![]({gifroot}/qskinny.states.state.gif)|\n")
        md.write(f"\n")
        md.write(f"- Transforming `QSK_SUBCONTROLS` declarations into sequences of if/switch statements\n")
        md.write(f"- Simple static code analysis for e.g. missing `Q_INVOKABLE` macro in skinlet declarations\n")
        md.write(f"\n")
        md.write(f"![]({gifroot}/qskinny.missing.qinvokable.quickfix.gif)\n")
        md.write(f"\n")
        md.write(f"# Commands\n")
        md.write(f"\n")

        commands = content.get('contributes', {}).get('commands', [])
        for command in commands:
            md.write(f"## {command['title']}\n")
            md.write("\n")
            md.write(f"{highlightTokens(command['description'])}\n")
            md.write("\n")
            md.write(f"__Input__\n")
            md.write("\n")
            md.write("```cpp\n")
            with open(f"{txtroot}/{command['command']}.input", "r") as file:
                snippet = file.read().rstrip()
                md.write(f"{snippet}\n")
            md.write("```\n")
            md.write("\n")
            md.write(f"__Output__\n")
            md.write("\n")
            md.write("```cpp\n")
            with open(f"{txtroot}/{command['command']}.output", "r") as file:
                snippet = file.read().rstrip()
                md.write(f"{snippet}\n")
            md.write("```\n")
            md.write("\n")
            md.write(f"![./doc/{command['command']}]({gifroot}/{command['command']}.gif)\n")
            md.write("\n")

        md.write(f"# Extension Settings\n")
        md.write(f"\n")
        md.write(f"|ID|Type|Default|Description|\n")
        md.write(f"|-|-|-|-|\n")
        properties = content.get('contributes', {}).get('configuration', {}).get('properties', {})
        for property_name, property_value in properties.items():
            md.write(f"|{property_name}|{property_value['type']}|{property_value['default']}|{property_value['description']}|\n")

        pass
