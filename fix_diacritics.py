import json, re
f=open('src/models/catalog/positive.json', 'r')
data=json.load(f)
f.close()
mapping=[(r'linistea', 'liniștea'), (r'profunda', 'profundă'), (r'cand', 'când'), (r'lupti', 'lupți'), (r'gandurile', 'gândurile'), (r'multumire', 'mulțumire'), (r'imobila', 'imobilă'), (r'si', 'și'), (r'meditativa', 'meditativă'), (r'suprafata', 'suprafața'), (r'apa', 'apă'), (r'nemiscata', 'nemiscată'), (r'activa', 'activă'), (r'urmareste', 'urmărește'), (r'opresti', 'oprești'), (r'incat', 'încât'),(r'sa auzi', 'să auzi'),(r'tacerea', 'tăcerea'),(r'calma', 'calmă'),(r'satisfactie', 'satisfacție'),(r'implinite', 'împlinite'),(r'urgenta', 'urgența'),(r'forma', 'formă'),(r'excitatie', 'excitație'),(r'pasnica', 'pașnică'),(r'autentica', 'autentică'),(r'cumparata', 'cumpărată'),(r'fortata', 'forțată'),(r'prezenta', 'prezență'),(r'pasiva', 'pasivă'),(r'renunti', 'renunți'),(r'gasesti', 'găsești'),(r'intre', 'între'),(r'actiune', 'acțiune'),(r'bunastarii', 'bunaștării'),(r'durabile', 'durabile'),(r'insuti', 'însuți'),(r'constienta', 'conștientă')]
for old, new in mapping:
    data = re.sub(rf'\\b{old}\\b', new, json.dumps(data, ensure_ascii=False))
    data = json.loads(data)
f=open('src/models/catalog/positive.json', 'w')
json.dump(data, f, indent=2, ensure_ascii=False)
f.close()
