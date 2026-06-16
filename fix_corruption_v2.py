import json

def fix_corruption(text):
    mapping = [
        ('outșide', 'outside'),
        ('șilence', 'silence'),
        ('intenșity', 'intensity'),
        ('pasșive', 'passive')
    ]
    for old, new in mapping:
        text = text.replace(old, new)
    return text

def fix_all(d):
    if isinstance(d, dict):
        return {k: fix_all(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [fix_all(i) for i in d]
    elif isinstance(d, str):
        return fix_corruption(d)
    else:
        return d

with open('src/models/catalog/positive.json', 'r') as f:
    data = json.load(f)

new_data = fix_all(data)

with open('src/models/catalog/positive.json', 'w') as f:
    json.dump(new_data, f, indent=2, ensure_ascii=False)
