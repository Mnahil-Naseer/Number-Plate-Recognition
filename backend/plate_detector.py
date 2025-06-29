import cv2
import pytesseract
import imutils
import re
from flask import Flask, request, jsonify
import os
from werkzeug.security import secure_filename

app = Flask(__name__)

# Path for storing the uploaded image
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Make sure the folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 👉 Function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 👉 Function to process image
def process_plate_image(image_path):
    image = cv2.imread(image_path)
    image = imutils.resize(image, width=600)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.bilateralFilter(gray, 11, 17, 17)
    edged = cv2.Canny(blurred, 30, 200)

    cnts = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:10]

    plate_image = None
    plate_text = ""

    for c in cnts:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.018 * peri, True)

        if len(approx) == 4:
            x, y, w, h = cv2.boundingRect(c)
            plate_image = gray[y:y + h, x:x + w]
            break

    if plate_image is not None:
        plate_text = pytesseract.image_to_string(plate_image, config='--psm 8')
        plate_text_cleaned = plate_text.strip().replace('\n', '').replace(' ', '')
        return plate_text_cleaned
    else:
        return None

# 👉 API route to handle image upload
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process image
        plate_text = process_plate_image(file_path)
        if plate_text:
            is_government = any(re.search(pattern, plate_text.upper()) for pattern in [r'\bGOVT\b', r'\bGOVERNMENT\b', r'\bG-\d+\b', r'\bGB\b'])
            plate_type = 'Government Plate' if is_government else 'Private Plate'
            return jsonify({'plate': plate_text, 'type': plate_type})
        else:
            return jsonify({'error': 'No plate detected'}), 404
    else:
        return jsonify({'error': 'Invalid file format'}), 400

if __name__ == "__main__":
    app.run(debug=True)
