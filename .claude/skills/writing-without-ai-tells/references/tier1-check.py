import re, sys, html

VOCAB = set("""delve delves delving tapestry testament vibrant pivotal crucial intricate intricacies
meticulous meticulously bolster bolstered garner garnered underscore underscores interplay multifaceted
foster fostering leverage utilize commence facilitate encompass encompassing paramount groundbreaking
transformative seamless seamlessly robust endeavor aforementioned harnessing spearheading showcasing
highlighting emphasizing enhancing unprecedented remarkable stunning profound synergy boasts
empower elevate streamline supercharge valuable enduring""".split())
COPULA  = r"\b(serves as|stands as|marks a|represents a|boasts|features a|offers a)\b"
NEGPAR  = r"(not only\b[^.]{0,60}\bbut\b|it'?s not just|isn'?t just|not merely)"
SIGNPOST= r"(let'?s dive|let'?s explore|let'?s break this down|here'?s what you need to know|without further ado)"
APHORISM= r"(is the language of|is the currency of|the architecture of|becomes a trap|is not a \w+ but a)"

def sentences(t):
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', t) if s.strip()]

def check(name, text):
    issues=[]
    # 1 dashes
    d=len(re.findall(r'[—–]', text)) + len(re.findall(r'\s--?\s', text))
    if d: issues.append(f"T1.1 dashes: {d}")
    # 2 vocab
    hits=sorted({w for w in re.findall(r"[A-Za-z']+", text.lower()) if w in VOCAB})
    if hits: issues.append(f"T1.2 vocab: {', '.join(hits)}")
    # 3 uniform lengths
    L=[len(s.split()) for s in sentences(text)]
    unif=sum(1 for i in range(len(L)-2) if max(L[i:i+3])-min(L[i:i+3])<=2)
    if unif: issues.append(f"T1.3 uniform-length runs: {unif}")
    # 4 short declarative runs
    run=best=0
    for x in L:
        run = run+1 if x<10 else 0
        best=max(best,run)
    if best>=3: issues.append(f"T1.4 short-declarative run: {best}")
    # 5-8
    for label,pat in [("T1.5 copula",COPULA),("T1.6 neg-parallelism",NEGPAR),
                      ("T1.7 signposting",SIGNPOST),("T1.8 aphorism",APHORISM)]:
        n=len(re.findall(pat,text,re.I))
        if n: issues.append(f"{label}: {n}")
    print(f"\n--- {name} ---")
    print("  CLEAN on Tier 1" if not issues else "\n".join("  "+i for i in issues))

BAD = ("In today's rapidly evolving landscape, our platform serves as a testament to seamless "
       "innovation. It's not just a tool, it's a revolution. Let's dive in. The results were clear. "
       "The team was ready. The launch was smooth. We leveraged cutting-edge technology to "
       "showcase a robust and vibrant solution — one that delivers real value — and empowers users. "
       "Design is the language of trust.")
check("NEGATIVE CONTROL (deliberate slop)", BAD)

import glob
def prose(path):
    t=open(path,encoding='utf-8').read()
    m=re.search(r'<main.*?</main>',t,re.S); t=m.group(0) if m else t
    t=re.sub(r'<(script|style|svg|nav)[\s\S]*?</\1>',' ',t)
    t=re.sub(r'alt="[^"]*"','',t)
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',t))).strip()

print("\n" + "="*58 + "\nSITE, Tier 1\n" + "="*58)
for f in sorted(glob.glob('*.html')):
    p=prose(f)
    if len(p.split())<30: continue
    check(f, p)

print("\n" + "="*58 + "\nSITE, Tier 2 (expect keeps)\n" + "="*58)
for f in sorted(glob.glob('*.html')):
    raw=open(f,encoding='utf-8').read()
    m=re.search(r'<main.*?</main>',raw,re.S)
    if not m: continue
    b=len(re.findall(r'<strong>', m.group(0)))
    if b>5: print(f"  {f}: boldface density {b} (threshold ~5) -> review, keep list lead-ins")
