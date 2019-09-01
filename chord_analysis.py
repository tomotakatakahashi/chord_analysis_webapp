"""Chord Analysis Module

T. Fujishima, "Realtime chord recognition of musical sound: A system using Common Lisp Music",
in Proceedings of thee International Computer Music Conference. Beijing:
International Computer Music Association, 1999."""
from itertools import product

import numpy as np
import librosa
from sklearn.neighbors import NearestNeighbors

_CHORD_TYPE_FEATURES = np.array(
    [
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], # Maj
        [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0], # min
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1], # Maj7
        [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0], # m7
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], # dom7
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0], # m7b5
    ]
)

_CHORD_TYPE_NAMES = [
    "", "m", "M7", "m7", "7", "m7(b5)"
]

_NOTE_NAMES = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
]

def _generate_chords(chord_type_features, chord_type_names, note_names):
    chord_names = []
    chord_features = []

    for (i, note), (j, typ) in product(enumerate(note_names), enumerate(chord_type_names)):
        chord_names.append(note + typ)
        chord_features.append(np.tile(chord_type_features[j], 2)[12 - i: 24 - i])

    return chord_names, np.array(chord_features)


CHORD_NAMES, CHORD_FEATURES = _generate_chords(
    _CHORD_TYPE_FEATURES,
    _CHORD_TYPE_NAMES,
    _NOTE_NAMES
)

def audio_wave_to_chromagram_seq(audio_wave, sampling_rate):
    """Audio wave to Chromagram Seq"""
    chromagram = librosa.feature.chroma_cqt(
        y=audio_wave, sr=sampling_rate, bins_per_octave=36
    )

    _, beats = librosa.beat.beat_track(y=audio_wave, sr=sampling_rate)
    timeline = librosa.frames_to_time(np.concatenate(([0], beats)))

    chromagram_sync = librosa.util.sync(chromagram, beats, aggregate=np.median).T

    return chromagram_sync, timeline

def chromagram_seq_to_chord_seq(chromagram_seq):
    """Chromagram seq to Chord seq by Nearest Neighbor"""
    nbrs = NearestNeighbors(n_neighbors=1, algorithm='auto').fit(CHORD_FEATURES)
    _, ind = nbrs.kneighbors(chromagram_seq)
    return [CHORD_NAMES[i] for i in ind[:, 0]]

def audio_path_to_chord_seq(audio_path):
    """Audio path to Chord seq"""
    audio_wave, sampling_rate = librosa.load(audio_path, res_type="kaiser_fast")
    chromagram_seq, timeline = audio_wave_to_chromagram_seq(audio_wave, sampling_rate)
    chord_seq = chromagram_seq_to_chord_seq(chromagram_seq)
    return chord_seq, timeline
