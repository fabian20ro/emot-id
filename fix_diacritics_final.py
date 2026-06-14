import json

def fix_ro(text):
    replacements = [
        ('linistea', 'liniștea'),
        ('profunda', 'profundă'),
        ('cand', 'când'),
        ('lupti', 'lupți'),
        ('gandurile', 'gândurile'),
        ('multumire', 'mulțumire'),
        ('imobila', 'imobilă'),
        ('si', 'și'),
        ('meditativa', 'meditativă'),
        ('suprafata', 'suprafața'),
        ('apa', 'apă'),
        ('nemiscata', 'nemiscată'),
        ('activa', 'activă'),
        ('urmareste', 'urmărește'),
        ('opresti', 'oprești'),
        ('incat', 'încât'),
        ('sa auzi', 'să auzi'),
        ('tacerea', 'tăcerea'),
        ('calma', 'calmă'),
        ('satisfactie', 'satisfacție'),
        ('implinite', 'împlinite'),
        ('urgenta', 'urgența'),
        ('forma', 'formă'),
        ('excitatie', 'excitație'),
        ('pasnica', 'pașnică'),
        ('autentica', 'autentică'),
        ('cumparata', 'cumpărată'),
        ('fortata', 'forțată'),
        ('prezenta', 'prezență'),
        ('pasiva', 'pasivă'),
        ('renunti', 'renunți'),
        ('gasesti', 'găsești'),
        ('intre', 'între'),
        ('actiune', 'acțiune'),
        ('bunastarii', 'bunaștării'),
        ('durabile', 'durabile'),
        ('insuti', 'însuți'),
        ('constienta', 'conștientă'),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text

def replace_in_dict(d):
    if isinstance(d, dict):
        return {k: replace_in_dict(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [replace_in_dict(i) for i in d]
    elif isinstance(d, str):
        return fix_ro(d)
    else:
        return d

with open('src/models/catalog/positive.json', 'r') as f:
    data = json.load(f)

new_data = replace_in_dict(data)

with open('src/models/catalog/positive.json', 'w') as f:
    json.dump(new_data, f, indent=2, ensure_ascii=False)
