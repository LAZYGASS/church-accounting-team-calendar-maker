
# 기존 PPT 로드
prs = Presentation('template.pptx')

# 서식 정보 추출
for slide in prs.slides:
    for shape in slide.shapes:
        # 위치, 크기, 폰트, 색상 등 추출
        print(f"Shape: {shape.name}")
        if hasattr(shape, "text"):
            print(f"Text: {shape.text}")