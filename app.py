"""Web App by Flask"""
import os
import tempfile

from flask import Flask, request, redirect, url_for, render_template, jsonify

import chord_analysis

ALLOWED_EXTENSIONS = {"mp3", }

app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(12)


def allowed_file(filename):
    """File Extension Checker"""
    return '.' in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def index_page():
    """Render the Index Page"""
    return render_template("index.html")

@app.route('/chord_tracker', methods=['GET', 'POST'])
def upload_file():
    """API part"""
    if request.method == 'POST':
        if "fileIpt" not in request.files or request.files["fileIpt"].filename == "":
            return jsonify(
                {
                    "result": "failure",
                    "message": "No file part",
                }
            )
        file = request.files["fileIpt"]
        if file and allowed_file(file.filename):
            with tempfile.NamedTemporaryFile(mode="wb", delete=False) as tmp_file:
                tmp_file.write(file.read())
            chord_seq, timeline = chord_analysis.audio_path_to_chord_seq(
                tmp_file.name
            )
            return jsonify(
                {
                    "result": "success",
                    "chord_seq": chord_seq,
                    "timeline": timeline.tolist(),
                }
            )
    return redirect(url_for("index_page"))
