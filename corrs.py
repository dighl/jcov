# author   : Johann-Mattis List
# email    : mattis.list@uni-marburg.de
# created  : 2014-08-19 18:24
# modified : 2014-08-19 18:24
"""
<++>
"""

__author__="Johann-Mattis List"
__date__="2014-08-19"

from lingpyd import *
from lingpyd.align._align.confidence import *

lex = LexStat('PIE.csv')
alm = Alignments(lex)
alm.align()

corrs,occs = get_correspondences(alm,'cogid')

# serialize the wordlist
wl = {}
for concept in alm.concepts:

    entries = alm.get_list(concept=concept,flat=True)
    cogids = [alm[idx, 'cogid'] for idx in entries]
    words = [alm[idx,'ipa'] for idx in entries]
    alms = [alm[idx,'alignment'] for idx in entries]
    langs = [alm[idx,'doculect'] for idx in entries]
    
    checkalm = lambda x: x if type(x) == str else ' '.join(x)

    wl[concept] = [list(k) for k in sorted(
            zip(
                langs,
                [str(x) for x in entries],
                words,
                [str(x) for x in cogids],
                [checkalm(x) for x in alms], #[' '.join(x).replace('  ',' ') for x in alms]
                ),
            key = lambda x: int(x[3])
            )]

# make simple gloss id for internal use as id
gloss2id = list(
        zip(
            alm.gloss,
            [str(x) for x in range(1,len(alm.gloss)+1)]
            )
        )
id2gloss = dict([[b,a] for a,b in gloss2id])
gloss2id = dict(gloss2id)



import json
f = open('corrs.js','w')
f.write('CORRS = '+json.dumps(corrs)+';\n')
f.write('LANGS = '+json.dumps(alm.taxa)+';\n')
f.write('OCCS = '+json.dumps(occs)+';\n')
f.write('WLS = '+json.dumps(wl)+';\n')
f.write('GlossId = '+json.dumps(gloss2id)+';\n')
f.write('IdGloss = '+json.dumps(id2gloss)+';\n')
f.close()
