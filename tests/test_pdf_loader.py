from app.services.pdf_loader import clean_text, chunk_text


def test_clean_text_collapses_whitespace():
    assert clean_text("hello    world\n\n\n") == "hello world"


def test_chunk_text_respects_size_and_overlap():
    text = " ".join(f"word{i}" for i in range(1000))
    chunks = chunk_text(text, chunk_size=100, overlap=20)
    assert len(chunks) > 1
    first_words = chunks[0].split()
    second_words = chunks[1].split()
    assert len(first_words) == 100
    # overlap: last 20 words of chunk 1 == first 20 words of chunk 2
    assert first_words[-20:] == second_words[:20]
