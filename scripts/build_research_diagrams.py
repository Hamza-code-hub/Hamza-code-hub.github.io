"""Build accessible, original SVG explanations of the four published methods.

These are conceptual redraws, not reproductions of the papers' figures.
Keep details aligned with the linked primary sources in each research page.
"""
from html import escape
from pathlib import Path
import textwrap

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'images' / 'research'
OUT.mkdir(parents=True, exist_ok=True)

PAPERS = [
    {
        'slug': '3d-mobibrainnet', 'name': '3D-MobiBrainNet',
        'subtitle': 'Three anatomical views, one volumetric classifier',
        'description': 'ADNI brain MRI is processed in parallel axial, coronal and sagittal branches. Depthwise-separable bottlenecks, pooling and feature recalibration feed feature fusion, 3D convolution and pooling, followed by a three-class softmax output. Training uses categorical cross-entropy; test and cross-validation findings are separate.',
        'input': ('ADNI volumetric MRI', ['Three complementary anatomical views', 'Research labels: AD, MCI and cognitively normal']),
        'branch_label': 'PARALLEL ANATOMICAL BRANCHES',
        'branches': [
            ('Axial view', ['Depthwise-separable bottlenecks', 'Pooling + feature recalibration']),
            ('Coronal view', ['Depthwise-separable bottlenecks', 'Pooling + feature recalibration']),
            ('Sagittal view', ['Depthwise-separable bottlenecks', 'Pooling + feature recalibration']),
        ],
        'fusion': ('Multi-view feature fusion', ['Combine branch features', '3D convolution + pooling']),
        'output': ('Three-class softmax', ['Alzheimer\u2019s disease / Mild cognitive impairment', 'Cognitively normal']),
        'training': ('Training objective', ['Categorical cross-entropy', 'Adam optimization']),
        'evaluation': ('Separate evaluation settings', ['Reported test accuracy: 97.33%', 'Five-fold success rate: 90.162%']),
    },
    {
        'slug': 'widenet', 'name': 'WIDENet',
        'subtitle': 'Preserve detail while learning lesion context',
        'description': 'Dermoscopic RGB images pass through an edge-aware detail extractor and four wavelet transformer downsampling encoder stages. Each stage combines wavelet frequency features with convolution and attention. Bilinear decoding and encoder skip connections feed adaptive variance-weighted feature fusion, then a one-by-one convolution and sigmoid produce the binary lesion mask. The training objective is Dice loss.',
        'input': ('Dermoscopic RGB images', ['PH\u00b2 / ISIC 2017 / ISIC 2018; 256 \u00d7 256 input', 'Edge-aware detail extractor (EDE)']),
        'branch_label': 'FOUR WTDE ENCODER STAGES \u00b7 COMPLEMENTARY FEATURES',
        'branches': [
            ('Wavelet information', ['DWT approximation + H/V/D detail', 'Convolutional detail features']),
            ('Context + refinement', ['Convolution + multi-head attention', 'Residual feed-forward refinement']),
        ],
        'refinement': ('Fusion inside each WTDE stage', ['Concatenate + project complementary features', 'Repeat across four encoder stages']),
        'fusion': ('Decoder + AVFM', ['Bilinear upsampling with encoder skip connections', 'Adaptive variance-weighted multi-level feature fusion']),
        'output': ('Binary lesion mask', ['1 \u00d7 1 convolution \u2192 sigmoid', 'Threshold 0.5; output 256 \u00d7 256']),
        'training': ('Training objective', ['Dice loss', 'Adam optimization']),
        'evaluation': ('Mask-level evaluation', ['Dice / IoU / precision / recall', 'Compare with segmentation baselines']),
    },
    {
        'slug': 'diabetic-retinopathy', 'name': 'CHiVE: Diabetic retinopathy',
        'subtitle': 'Stable hierarchical features for five-class retinal grading',
        'description': 'APTOS retinal fundus images feed the compact hierarchical vision encoder CHiVE. Convolution and pooling, a Swish-inspired Nonlinear Unit, a Layer-wise Normalization Scheme and a Stochastic Regularization Module support five-class severity grading. The author confirms label-smoothed cross-entropy with coefficient 0.01 plus L2 regularization. The diagram groups components and does not assert an exact layer order.',
        'input': ('APTOS fundus images', ['Retinal image benchmark', 'Five diabetic retinopathy severity classes']),
        'branch_label': 'HIERARCHICAL ENCODER \u00b7 COMPONENTS OF ONE MODEL',
        'branches': [
            ('Retinal feature learning', ['Convolution + pooling', 'Swish-inspired Nonlinear Unit']),
            ('Training stability', ['Layer-wise Normalization Scheme', 'Stochastic Regularization Module']),
        ],
        'fusion': ('Compact hierarchical vision encoder', ['Integrate hierarchical retinal features', 'Prepare a compact severity representation']),
        'output': ('Five-class severity grading', ['No DR / Mild / Moderate', 'Severe / Proliferative DR']),
        'training': ('Training objective', ['Label-smoothed CE; coefficient 0.01', 'L2 weight regularization']),
        'evaluation': ('APTOS benchmark evaluation', ['Accuracy / precision / recall / F1', 'CHiVE 98.91%; Swin-T 83.45% accuracy', 'Component ablations + ROC analysis']),
    },
    {
        'slug': 'resilient-uav-network-security', 'name': 'Resilient UAV network security',
        'subtitle': 'Align sparse attributes with temporal traffic context',
        'description': 'CIC-IDS2017 and UNSW-NB15 traffic feed TabNet for sparse tabular representation and a Transformer encoder for temporal representation. Reciprocal multi-head cross-attention aligns the two streams, followed by residual refinement, temporal aggregation and fusion to classify intrusions. FGSM augments training. These are general network benchmarks, not real UAV flight traffic.',
        'input': ('Network traffic benchmarks', ['CIC-IDS2017 + UNSW-NB15', 'Current flow attributes + synchronized traffic history']),
        'branch_label': 'COMPLEMENTARY REPRESENTATION STREAMS',
        'branches': [
            ('TabNet', ['Sparse, attribute-aware representation', 'Current traffic features']),
            ('Transformer encoder', ['Temporal sequence representation', 'Dynamic traffic context']),
        ],
        'fusion': ('Reciprocal multi-head cross-attention', ['Align sparse and temporal features', 'Residual refinement \u2192 temporal aggregation + fusion']),
        'output': ('Intrusion classification', ['Predict benign or attack class', 'Assess minority-attack recall and robustness']),
        'training': ('Adversarial training branch', ['FGSM perturbations', 'Focal + adversarial + sparsity objectives']),
        'evaluation': ('General-network evaluation', ['Clean and adversarial performance', 'UAV-specific flight validation remains future work']),
    },
]

COLORS = {'background': '#121816', 'card': '#1c2621', 'border': '#435348', 'text': '#f1f5ee', 'muted': '#b8c8bb', 'gold': '#f0c46d', 'green': '#a0dfc1'}

def text(x, y, value, size=22, color='text', weight=400, anchor='start'):
    return f'<text x="{x}" y="{y}" fill="{COLORS[color]}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>'

def card(x, y, width, height, title, lines, mobile=False, accent=False):
    parts = [f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="18" fill="{COLORS["card"]}" stroke="{COLORS["gold"] if accent else COLORS["border"]}" stroke-width="1.5"/>']
    title_size = 27 if mobile else 25
    title_limit = int((width - 48) / (title_size * .55))
    title_lines = textwrap.wrap(title, width=title_limit)
    position = y + 39
    for line in title_lines:
        parts.append(text(x + 24, position, line, title_size, 'gold' if accent else 'text', 600))
        position += 31
    position += 6
    body_size = 24 if mobile else 21
    limit = int((width - 48) / (body_size * .53))
    for line in lines:
        for wrapped in textwrap.wrap(line, width=limit, break_long_words=False):
            parts.append(text(x + 24, position, wrapped, body_size, 'muted'))
            position += 29
    if position > y + height - 7:
        raise ValueError(f'Text does not fit: {title}: {position}, bottom {y + height}')
    return '\n'.join(parts)

def arrow(x1, y1, x2, y2):
    return f'<path d="M{x1},{y1} L{x2},{y2}" fill="none" stroke="{COLORS["gold"]}" stroke-width="2.5" marker-end="url(#arrow)"/>'

def build(paper, mobile):
    width = 680 if mobile else 1200
    margin = 26 if mobile else 44
    inner = width - margin * 2
    midpoint = width / 2
    parts = []
    parts.append(text(margin, 43, 'RESEARCH / METHODOLOGY', 16, 'gold', 600))
    name_lines = textwrap.wrap(paper['name'], width=36 if mobile else 63)
    y = 89
    for line in name_lines:
        parts.append(text(margin, y, line, 32 if mobile else 34, weight=600))
        y += 42
    for line in textwrap.wrap(paper['subtitle'], width=45 if mobile else 90):
        parts.append(text(margin, y + 3, line, 21, 'muted'))
        y += 29
    y += 30
    input_height = 220 if mobile else 142
    parts.append(card(margin, y, inner, input_height, *paper['input'], mobile, True))
    y += input_height
    parts.append(arrow(midpoint, y, midpoint, y + 40))
    y += 69
    label = paper['branch_label']
    for line in textwrap.wrap(label, width=46 if mobile else 90):
        parts.append(text(margin, y, line, 16, 'green', 600))
        y += 24
    y += 10
    count = len(paper['branches'])
    if mobile:
        # All cards sit inside one group. No arrows between parallel branches.
        branch_height = 196
        group_height = count * (branch_height + 16) + 12
        parts.append(f'<rect x="{margin}" y="{y - 8}" width="{inner}" height="{group_height}" rx="22" fill="none" stroke="{COLORS["green"]}" stroke-dasharray="5 7"/>')
        for index, item in enumerate(paper['branches']):
            parts.append(card(margin + 12, y + index * (branch_height + 16) + 4, inner - 24, branch_height, *item, mobile))
        y += group_height - 8
    else:
        gap = 20
        card_width = (inner - gap * (count - 1)) / count
        branch_height = 224
        centers = [margin + index * (card_width + gap) + card_width / 2 for index in range(count)]
        parts.append(f'<path d="M{centers[0]},{y - 15} H{centers[-1]}" fill="none" stroke="{COLORS["gold"]}" stroke-width="2"/>')
        for index, item in enumerate(paper['branches']):
            parts.append(card(margin + index * (card_width + gap), y, card_width, branch_height, *item))
            parts.append(arrow(centers[index], y - 15, centers[index], y - 2))
        y += branch_height
        parts.append(f'<path d="M{centers[0]},{y} V{y + 15} H{centers[-1]} V{y}" fill="none" stroke="{COLORS["gold"]}" stroke-width="2"/>')
    parts.append(arrow(midpoint, y + (4 if mobile else 15), midpoint, y + 44))
    y += 53
    block_height = 230 if mobile else 142
    if paper.get('refinement'):
        parts.append(card(margin, y, inner, block_height, *paper['refinement'], mobile))
        y += block_height
        parts.append(arrow(midpoint, y, midpoint, y + 40))
        y += 49
    parts.append(card(margin, y, inner, block_height, *paper['fusion'], mobile, True))
    y += block_height
    parts.append(arrow(midpoint, y, midpoint, y + 40))
    y += 49
    parts.append(card(margin, y, inner, 198 if mobile else 142, *paper['output'], mobile))
    y += 223 if mobile else 174
    parts.append(text(margin, y, 'TRAINING + EVALUATION CONTEXT', 16, 'green', 600))
    y += 21
    if mobile:
        for item in [paper['training'], paper['evaluation']]:
            parts.append(card(margin, y, inner, 202, *item, mobile))
            y += 218
    else:
        context_width = (inner - 20) / 2
        for index, item in enumerate([paper['training'], paper['evaluation']]):
            parts.append(card(margin + index * (context_width + 20), y, context_width, 196, *item))
        y += 213
    y += 17
    for line in textwrap.wrap('Original conceptual redraw. Arrows summarize information flow; consult the paper for the complete architecture and protocol.', width=55 if mobile else 106):
        parts.append(text(margin, y, line, 18, 'muted'))
        y += 25
    height = y + 16
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title description">
<title id="title">{escape(paper['name'])}: methodology flowchart</title>
<desc id="description">{escape(paper['description'])}</desc>
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L9 4.5 L0 9 Z" fill="{COLORS['gold']}"/></marker></defs>
<rect width="{width}" height="{height}" rx="24" fill="{COLORS['background']}"/>
<g font-family="Arial, Helvetica, sans-serif">{''.join(parts)}</g>
</svg>
'''
    suffix = '-mobile' if mobile else ''
    (OUT / (paper['slug'] + '-methodology' + suffix + '.svg')).write_text(svg, encoding='utf-8', newline='\n')

if __name__ == '__main__':
    for paper in PAPERS:
        for mobile in (False, True):
            build(paper, mobile)
    print('Built eight accessible SVG methodology images (four papers, desktop and mobile).')
