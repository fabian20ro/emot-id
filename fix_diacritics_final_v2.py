import json
import re

def fix_ro(text):
    # Only replace if it's a whole word (to avoid side effects in English strings if they were somehow mixed, 
    # though replace_in_dict should prevent that. But let's be safe.)
    # We use word boundaries \b.
    replacements = [
        (r'linistea', 'liniștea'),
        (r'profunda', 'profundă'),
        (r'cand', 'când'),
        (r'lupti', 'lupți'),
        (r'gandurile', 'gândurile'),
        (r'multumire', 'mulțumire'),
        (r'imobila', 'imobilă'),
        (r'si', 'și'),
        (r'meditativa', 'meditativă'),
        (r'suprafata', 'suprafața'),
        (r'apa', 'apă'),
        (r'nemiscata', 'nemiscată'),
        (r'activa', 'activă'),
        (r'urmareste', 'urmărește'),
        (r'opresti', 'oprești'),
        (r'incat', 'încât'),
        (r'sa auzi', 'să auzi'),
        (r'tacerea', 'tăcerea'),
        (r'calma', 'calmă'),
        (r'satisfactie', 'satisfacție'),
        (r'implinite', 'împlinite'),
        (r'urgenta', 'urgența'),
        (r'forma', 'formă'),
        (r'excitatie', 'excitație'),
        (r'pasnica', 'pașnică'),
        (r'autentica', 'autentică'),
        (r'cumparata', 'cumpărată'),
        (r'fortata', 'forțată'),
        (r'prezenta', 'prezență'),
        (r'pasiva', 'pasivă'),
        (r'renunti', 'renunți'),
        (r'gasesti', 'găsești'),
        (r'intre', 'între'),
        (r'actiune', 'acțiune'),
        (r'bunastarii', 'bunaștării'),
        (r'durabile', 'durabile'),
        (r'insuti', 'însuți'),
        (r'constienta', 'conștientă'),
    ]
    for old, new in replacements:
        # Use regex with word boundaries to avoid replacing substrings
        text = re.sub(rf'\b{old}\b', new, text)
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
