import json, base64

b = ''  # rode este script de dentro de sistema/src/

css = open(b + 'style.css', encoding='utf8').read()
dark = open(b + 'dark.css', encoding='utf8').read()
dm = ('@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){\n'
      + dark + '}}\n:root[data-theme="dark"]{\n' + dark + '}\n')
css = css.replace('/*DARK_MEDIA*/', dm)
msg = open(b + 'msg_block.html', encoding='utf8').read()
ficha = open(b + 'ficha.json', encoding='utf8').read()
kits = open(b + 'kits.json', encoding='utf8').read().replace('<', '\\u003c')
app = open(b + 'app.js', encoding='utf8').read()
LOGO = base64.b64encode(open(b + 'logo_h.png', 'rb').read()).decode()

head_extra = f'''<title>Escritório Online</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap">
<style>
{css}</style>'''

body = f'''<div class="shell">
 <aside class="sidebar">
  <div class="marca"><img src="data:image/png;base64,{LOGO}" alt="Jackeline Santos Advocacia"></div>
  <nav class="nav" id="nav" aria-label="Menu principal"></nav>
  <div class="relogio"><div class="hora" id="hora"></div><div class="dataext" id="dataext"></div></div>
  <div class="rodape"><div><div class="unome">Dra. Jackeline</div><div class="upapel">Administradora</div></div><button class="tema" id="tema" type="button">Claro / escuro</button></div>
 </aside>
 <main class="conteudo"><div id="aviso" role="status"></div><div id="view"></div></main>
</div>
<div id="modal"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
{msg}
<script>
const FICHA={ficha};
const KITD={kits};
{app}
</script>
'''

html = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
{head_extra}
</head>
<body>
{body}
</body>
</html>
'''

open(b + '../index.html', 'w', encoding='utf8').write(html)
print(len(html))
