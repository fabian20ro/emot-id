import json

def fix_corruption_robust(text):
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
        return fix_corruption_robust(d)
    else:
        return d

def fix_corruption_robust(text):
    mapping = [
        ('outșide', 'outside'),
        ('șilence', 'silence'),
        ('intenșity', 'intensity',),
        ('pasșive', 'passive')
    ]
    for old, new in mapping:
        text = text.replace(old, new)
    return text

# Wait, I noticed my previous script had a typo in the mapping list.
# I'll rewrite it correctly.
