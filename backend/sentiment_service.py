# sentiment_service.py
from flask import Flask, request, jsonify
from textblob import TextBlob

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    if not text.strip():
        return jsonify({'sentiment': 0.0})

    blob = TextBlob(text)
    sentiment = round(blob.sentiment.polarity, 3)  # value between -1 and +1
    return jsonify({'sentiment': sentiment})

if __name__ == '__main__':
    app.run(port=5001)
