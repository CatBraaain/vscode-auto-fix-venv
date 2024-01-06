# Auto Fix Venv

Automatically detect broken python venv and fix it.
(Currently works only in windows)

```mermaid
    flowchart TB;
        subgraph AutoFixVenv[Auto Fix Venv]
            direction LR
            venvExists{is there venv?}
            venvExists -- yes --> isBroken
                isBroken{is broken?}
                isBroken -- yes --> fix
                isBroken -- no --> nothing
            venvExists -- no --> nothing
        end

        subgraph Causes[The causes of breaking venv]
            subgraph ChangeVenvPath[changing venv path]
                direction LR
                1[changing project name]
                2[moving project folder]
                3[changing venv name]
                4[moving venv folder]
                1 ~~~ 2
                3 ~~~ 4

            end
        end

        subgraph RecreateVenv[Recreate Venv Manually]
            direction LR
            stillBroken{still Broken?}
            stillBroken -- yes --> recreate[recreate venv with command\n`auto-fix-venv.recreate`]
            stillBroken -- no --> allGood[all good]
        end

        AutoFixVenv ~~~ Causes ~~~ RecreateVenv


```

<!-- ![demo-gif](docs/demo.gif) -->

<!-- # Feature

- Automatically detect broken venv and fix it.
- Recreate venv with command `auto-fix-venv.recreate` when auto-fix not working. -->

# Keybindings

Nothing

# Extension Settings

Nothing
