/**
 * File: sequence_logo.js
 *
 * MEME and FASTA parsing and related d3 rendering: Alex Reynolds 
 * Sequence parsing and d3 rendering: Sam Lichtenberg (splichte@gmail.com)
 *
 * This file implements sequence logo generation for 
 * FASTA sequences and MEME motif table information via d3.
 *
 * See `https://en.wikipedia.org/wiki/Sequence_logo` 
 * for more information.
 *
 */

var SequenceLogo = SequenceLogo || {};

SequenceLogo.FASTA = class FASTA {
  constructor(
      records = null,
      alphabet = null,
      identifier = null,
      letter_probability_matrix = {},
      stack_heights = null,
      letter_heights = null
  )
  {
    this.records = records;
    this.alphabet = alphabet;
    this.identifier = identifier;
    this.letter_probability_matrix = letter_probability_matrix;
    this.stack_heights = stack_heights;
    this.letter_heights = letter_heights;
  }
  
  update_state() {
    SequenceLogo.Logo.update_stack_heights(this);
    SequenceLogo.Logo.update_letter_heights(this);
  }
}

SequenceLogo.MEME = class MEME {
  constructor(
      version = -1,
      alphabet = null,
      strands = null,
      background_frequencies = null,
      identifier = null,
      alternate_name = null,
      url = null,
      letter_probability_matrix = null,
      stack_heights = null,
      letter_heights = null) 
  {
    this.version = version;
    this.alphabet = alphabet;
    this.strands = strands;
    this.background_frequencies = background_frequencies;
    this.identifier = identifier;
    this.alternate_name = alternate_name;
    this.url = url;
    this.letter_probability_matrix = letter_probability_matrix;
    this.stack_heights = stack_heights;
    this.letter_heights = letter_heights;
  }
  
  update_state() {
    SequenceLogo.Logo.update_stack_heights(this);
    SequenceLogo.Logo.update_letter_heights(this);
  }
}

SequenceLogo.Logo = class Logo {
  constructor(
    color_scheme = null,
    seq_obj = null,
    item = null,
    mode = null,
    type = null,
    svg_width = 800,
    svg_height = 300,
    svg_letter_width = 710,
    svg_letter_height = 210
  )
  {
    this._color_scheme = color_scheme;
    this._seq_obj = seq_obj;
    this._item = item;
    this._mode = mode;
    this._type = type;
    this._svg_width = svg_width;
    this._svg_height = svg_height;
    this._svg_letter_width = svg_letter_width;
    this._svg_letter_height = svg_letter_height;
  }
  
  get color_scheme() { return this._color_scheme; }
  set color_scheme(color_scheme) { this._color_scheme = color_scheme; }
  
  get seq_obj() { return this._seq_obj; }
  set seq_obj(seq_obj) { this._seq_obj = seq_obj; }
  
  get item() { return this._item; }
  set item(item) { this._item = item; }
  
  get type() { return this._type; }
  set type(type) { this._type = type; }
  
  get svg_width() { return this._svg_width; }
  set svg_width(svg_width) { this._svg_width = parseInt(svg_width); }
  
  get svg_height() { return this._height; }
  set svg_height(svg_height) { this._svg_height = parseInt(svg_height); }
  
  get svg_letter_width() { return this._svg_letter_width; }
  set svg_letter_width(svg_letter_width) { this._svg_letter_width = parseInt(svg_letter_width); }
  
  get svg_letter_height() { return this._svg_letter_height; }
  set svg_letter_height(svg_letter_height) { this._svg_letter_height = parseInt(svg_letter_height); }
  
  display_attributes() {
    return {
      'type' : this._type,
      'color_scheme' : this._color_scheme,
      'svg_width' : this._svg_width,
      'svg_height' : this._svg_height,
      'svg_letter_width' : this._svg_letter_width,
      'svg_letter_height' : this._svg_letter_height
    }
  }
  
  static get MODE_PARSERS() {
    return {
      'fasta' : this.parse_FASTA,
      'mememotif' : this.parse_MEME_motif
    }
  }
  static get MAPPING() {
    return {
      'A' : 0,
      'C' : 1,
      'G' : 2,
      'T' : 3,
      'U' : 4,
      'D' : 5,
      'E' : 6,
      'F' : 7,
      'H' : 8,
      'I' : 9,
      'K' : 10,
      'L' : 11,
      'M' : 12,
      'N' : 13,
      'P' : 14,
      'Q' : 15,
      'R' : 16,
      'S' : 17,
      'V' : 18,
      'W' : 19,
      'Y' : 20,
      'B' : 21,
      'J' : 22,
      'O' : 23,
      'X' : 24,
      'Z' : 25
    };
  }
  static get COLOR_SCHEMES() { 
    return {
      'classic' : {
        'A' : 'green',
        'C' : 'blue',
        'T' : 'red',
        'U' : 'red',
        'G' : 'orange'
      },
      'nucleotide' : {
        'A' : 'green',
        'C' : 'blue',
        'T' : 'red',
        'U' : 'red',
        'G' : 'orange'
      },
      'base_pairing' : {
        'A' : 'darkorange',
        'C' : 'blue',
        'T' : 'darkorange',
        'U' : 'darkorange',
        'G' : 'blue'
      },
      'hydrophobicity' : {
        'A' : 'green',
        'C' : 'black',
        'T' : 'green',
        'D' : 'blue',
        'E' : 'blue',
        'F' : 'black',
        'H' : 'green',
        'I' : 'black',
        'K' : 'blue',
        'L' : 'black',
        'M' : 'black',
        'N' : 'blue',
        'P' : 'green',
        'Q' : 'blue',
        'R' : 'blue',
        'S' : 'green',
        'V' : 'black',
        'W' : 'black',
        'Y' : 'black'
      },
      'chemistry' : {
        'A' : 'black',
        'C' : 'green',
        'T' : 'green',
        'G' : 'green',
        'D' : 'red',
        'E' : 'red',
        'F' : 'black',
        'H' : 'blue',
        'I' : 'black',
        'K' : 'blue',
        'L' : 'black',
        'M' : 'black',
        'N' : 'purple',
        'P' : 'black',
        'Q' : 'purple',
        'R' : 'blue',
        'S' : 'green',
        'V' : 'black',
        'W' : 'black',
        'Y' : 'green'
      },
      'charge' : {
        'K' : 'blue',
        'R' : 'blue',
        'H' : 'blue',
        'D' : 'red',
        'E' : 'red'
      },
      'taylor' : {
        'A' : '#CCFF00',
        'C' : '#FFFF00',
        'D' : '#FF0000',
        'E' : '#FF0066',
        'F' : '#00FF66',
        'G' : '#FF9900',
        'H' : '#0066FF',
        'I' : '#66FF00',
        'K' : '#6600FF',
        'L' : '#33FF00',
        'M' : '#00FF00',
        'N' : '#CC00FF',
        'P' : '#FFCC00',
        'Q' : '#FF00CC',
        'R' : '#0000FF',
        'S' : '#FF3300',
        'T' : '#FF6600',
        'V' : '#99FF00',
        'W' : '#00CCFF',
        'Y' : '#00FFCC'
      },
      'epilogos-15state-human' : {
        'A' : '#FF0000',
        'B' : '#FF4500',
        'C' : '#32CD32',
        'D' : '#008000',
        'E' : '#006400',
        'F' : '#C2E105',
        'G' : '#FFFF00',
        'H' : '#66CDAA',
        'I' : '#8A91D0',
        'J' : '#CD5C5C',
        'K' : '#E9967A',
        'L' : '#BDB76B',
        'M' : '#808080',
        'N' : '#C0C0C0',
        'O' : '#fafafa',
      }
    }; 
  }
  static get PATHS() {
    return {
      'A' : 'M 11.21875 -16.1875 L 12.296875 0 L 15.734375 0 L 10.09375 -80.265625 L 6.375 -80.265625 L 0.578125 0 L 4.015625 0 L 5.109375 -16.1875 Z M 10.296875 -29.953125 L 6.046875 -29.953125 L 8.171875 -61.328125 Z M 10.296875 -29.953125',
      'C' : 'M 16.171875 -50.734375 C 16.046875 -57.375 15.734375 -61.578125 15 -65.890625 C 13.671875 -73.6875 11.546875 -78 8.953125 -78 C 4.078125 -78 1.046875 -62.53125 1.046875 -37.6875 C 1.046875 -13.046875 4.046875 2.421875 8.859375 2.421875 C 13.15625 2.421875 16.015625 -8.625 16.234375 -26.21875 L 12.78125 -26.21875 C 12.5625 -16.421875 11.171875 -10.84375 8.953125 -10.84375 C 6.203125 -10.84375 4.59375 -20.734375 4.59375 -37.46875 C 4.59375 -54.421875 6.28125 -64.53125 9.078125 -64.53125 C 10.3125 -64.53125 11.328125 -62.640625 12 -58.953125 C 12.375 -56.84375 12.5625 -54.84375 12.78125 -50.734375 Z M 16.171875 -50.734375',
      'T' : 'M 10.015625 -66.734375 L 15.5625 -66.734375 L 15.5625 -80.546875 L 0.359375 -80.546875 L 0.359375 -66.734375 L 6.125 -66.734375 L 6.125 0 L 10.015625 0 Z M 10.015625 -66.734375',
      'G' : 'M 16.1875 -41.375 L 9.53125 -41.375 L 9.53125 -28.1875 L 13.3125 -28.1875 C 13.234375 -23.859375 13 -21.21875 12.5 -18.46875 C 11.671875 -13.828125 10.421875 -11.078125 9.109375 -11.078125 C 6.359375 -11.078125 4.375 -22.265625 4.375 -38.109375 C 4.375 -54.671875 6.125 -64.703125 9.015625 -64.703125 C 10.203125 -64.703125 11.203125 -63.109375 11.953125 -60.0625 C 12.4375 -58.15625 12.6875 -56.359375 12.96875 -52.34375 L 16.1875 -52.34375 C 15.78125 -68.1875 13 -78.203125 9 -78.203125 C 4.21875 -78.203125 0.953125 -61.84375 0.953125 -37.890625 C 0.953125 -14.5625 4.234375 2.421875 8.71875 2.421875 C 10.953125 2.421875 12.453125 -1.265625 13.734375 -9.921875 L 14.140625 0.21875 L 16.1875 0.21875 Z M 16.1875 -41.375',
      'U' : 'M 13.25 -77.953125 L 13.25 -25.125 C 13.25 -15.71875 12.0625 -11.234375 9.59375 -11.234375 C 7.125 -11.234375 5.9375 -15.71875 5.9375 -25.125 L 5.9375 -77.953125 L 2 -77.953125 L 2 -25.125 C 2 -16.359375 2.578125 -10.15625 3.859375 -5.453125 C 5.25 -0.328125 7.28125 2.453125 9.59375 2.453125 C 11.90625 2.453125 13.921875 -0.328125 15.328125 -5.453125 C 16.609375 -10.15625 17.1875 -16.359375 17.1875 -25.125 L 17.1875 -77.953125 Z M 13.25 -77.953125',
      'D' : 'M 1.25 0 L 5.890625 0 C 7.703125 0 8.84375 -1.921875 9.640625 -6.265625 C 10.578125 -11.28125 11.09375 -18.578125 11.09375 -26.90625 C 11.09375 -35.15625 10.578125 -42.453125 9.640625 -47.53125 C 8.84375 -51.890625 7.71875 -53.734375 5.890625 -53.734375 L 1.25 -53.734375 Z M 3.703125 -9.21875 L 3.703125 -44.515625 L 5.890625 -44.515625 C 7.734375 -44.515625 8.640625 -38.6875 8.640625 -26.828125 C 8.640625 -15.03125 7.734375 -9.21875 5.890625 -9.21875 Z M 3.703125 -9.21875',
      'E' : 'M 4.109375 -23.015625 L 10.375 -23.015625 L 10.375 -32.171875 L 4.109375 -32.171875 L 4.109375 -44.265625 L 10.875 -44.265625 L 10.875 -53.4375 L 1.421875 -53.4375 L 1.421875 0 L 11.203125 0 L 11.203125 -9.15625 L 4.109375 -9.15625 Z M 4.109375 -23.015625',
      'F' : 'M 4.296875 -23.125 L 10.421875 -23.125 L 10.421875 -32.328125 L 4.296875 -32.328125 L 4.296875 -44.484375 L 11.25 -44.484375 L 11.25 -53.6875 L 1.421875 -53.6875 L 1.421875 0 L 4.296875 0 Z M 4.296875 -23.125',
      'H' : 'M 8.4375 -24.3125 L 8.4375 0 L 10.9375 0 L 10.9375 -53.53125 L 8.421875 -53.53125 L 8.421875 -33.484375 L 3.625 -33.484375 L 3.625 -53.53125 L 1.125 -53.53125 L 1.125 0 L 3.625 0 L 3.625 -24.3125 Z M 8.4375 -24.3125',
      'I' : 'M 8.375 -49.5625 L 12.015625 -49.5625 C 12.515625 -49.5625 12.75 -50.21875 12.75 -51.546875 C 12.75 -52.78125 12.515625 -53.453125 12.015625 -53.453125 L 3.671875 -53.453125 C 3.1875 -53.453125 2.953125 -52.78125 2.953125 -51.546875 C 2.953125 -50.21875 3.1875 -49.5625 3.671875 -49.5625 L 7.3125 -49.5625 L 7.3125 -3.890625 L 3.671875 -3.890625 C 3.1875 -3.890625 2.953125 -3.234375 2.953125 -2 C 2.953125 -0.671875 3.1875 0 3.671875 0 L 12.015625 0 C 12.484375 0 12.75 -0.671875 12.75 -2 C 12.75 -3.234375 12.515625 -3.890625 12.015625 -3.890625 L 8.375 -3.890625 Z M 8.375 -49.5625',
      'K' : 'M 3.40625 -17.90625 L 4.5625 -23.625 L 8.203125 0 L 10.921875 0 L 6.015625 -30.453125 L 10.453125 -53.484375 L 7.75 -53.484375 L 3.40625 -30.015625 L 3.40625 -53.484375 L 1.125 -53.484375 L 1.125 0 L 3.40625 0 Z M 3.40625 -17.90625',
      'L' : 'M 4.515625 -53.4375 L 1.5625 -53.4375 L 1.5625 0 L 11.359375 0 L 11.359375 -9.15625 L 4.515625 -9.15625 Z M 4.515625 -53.4375',
      'M' : 'M 3 -41.90625 L 4.8125 0 L 6.890625 0 L 8.6875 -41.90625 L 8.6875 0 L 10.765625 0 L 10.765625 -53.78125 L 7.625 -53.78125 L 5.859375 -10.984375 L 4.03125 -53.78125 L 0.921875 -53.78125 L 0.921875 0 L 3 0 Z M 3 -41.90625',
      'N' : 'M 8.46875 0 L 10.953125 0 L 10.953125 -53.6875 L 8.46875 -53.6875 L 8.46875 -17.15625 L 3.671875 -53.6875 L 1.125 -53.6875 L 1.125 0 L 3.609375 0 L 3.609375 -37.109375 Z M 8.46875 0',
      'P' : 'M 3.984375 -19.140625 L 7.28125 -19.140625 C 9.65625 -19.140625 11.171875 -26.125 11.171875 -37.03125 C 11.171875 -47.765625 9.703125 -53.65625 7.015625 -53.65625 L 1.34375 -53.65625 L 1.34375 0 L 3.984375 0 Z M 3.984375 -28.34375 L 3.984375 -44.453125 L 6.453125 -44.453125 C 7.875 -44.453125 8.515625 -41.890625 8.515625 -36.359375 C 8.515625 -30.921875 7.875 -28.34375 6.453125 -28.34375 Z M 3.984375 -28.34375',
      'Q' : 'M 9.234375 -6.890625 C 9.921875 -10.921875 10.34375 -17.609375 10.34375 -24.171875 C 10.34375 -31.34375 9.828125 -38.234375 8.9375 -42.859375 C 8.0625 -47.40625 6.921875 -49.625 5.46875 -49.625 C 4.03125 -49.625 2.890625 -47.40625 2.015625 -42.859375 C 1.125 -38.234375 0.59375 -31.34375 0.59375 -24.046875 C 0.59375 -16.734375 1.125 -9.84375 2.015625 -5.21875 C 2.890625 -0.671875 4.046875 1.546875 5.46875 1.546875 C 6.515625 1.546875 7.296875 0.53125 8.09375 -1.8125 L 9.296875 3.609375 L 10.34375 -1.8125 Z M 6.671875 -18.625 L 5.609375 -13.1875 L 6.6875 -8.296875 C 6.359375 -7.5 5.90625 -7.03125 5.453125 -7.03125 C 3.796875 -7.03125 2.6875 -13.796875 2.6875 -24.046875 C 2.6875 -34.28125 3.796875 -41.046875 5.46875 -41.046875 C 7.171875 -41.046875 8.265625 -34.359375 8.265625 -23.96875 C 8.265625 -19.953125 8.109375 -16.34375 7.8125 -13.390625 Z M 6.671875 -18.625',
      'R' : 'M 3.765625 -21.140625 L 6.578125 -21.140625 C 7.640625 -21.140625 8.09375 -19.234375 8.09375 -14.78125 C 8.09375 -14.34375 8.09375 -13.609375 8.078125 -12.65625 C 8.0625 -11.265625 8.0625 -9.953125 8.0625 -9.140625 C 8.0625 -4.171875 8.125 -2.5625 8.4375 0 L 11.078125 0 L 11.078125 -1.96875 C 10.703125 -2.921875 10.546875 -4.03125 10.546875 -6.359375 C 10.484375 -22.09375 10.421875 -22.828125 8.90625 -25.75 C 10.234375 -28.09375 10.90625 -32.40625 10.90625 -38.921875 C 10.90625 -43.15625 10.578125 -47.046875 10.015625 -49.671875 C 9.46875 -52.15625 8.71875 -53.328125 7.703125 -53.328125 L 1.3125 -53.328125 L 1.3125 0 L 3.765625 0 Z M 3.765625 -30.28125 L 3.765625 -44.1875 L 6.71875 -44.1875 C 7.421875 -44.1875 7.71875 -43.890625 8.015625 -42.796875 C 8.3125 -41.703125 8.453125 -39.875 8.453125 -37.390625 C 8.453125 -34.828125 8.296875 -32.78125 8.015625 -31.671875 C 7.75 -30.65625 7.421875 -30.28125 6.71875 -30.28125 Z M 3.765625 -30.28125',
      'S' : 'M 9.890625 -35.453125 C 9.890625 -40.140625 9.640625 -43.21875 9.0625 -46.015625 C 8.265625 -49.78125 6.9375 -51.8125 5.234375 -51.8125 C 2.375 -51.8125 0.734375 -46.078125 0.734375 -36.15625 C 0.734375 -28.25 1.65625 -24.40625 4.078125 -22.4375 L 5.734375 -21.046875 C 7.359375 -19.71875 7.96875 -17.765625 7.96875 -13.640625 C 7.96875 -9.375 7.0625 -6.78125 5.578125 -6.78125 C 3.90625 -6.78125 2.984375 -9.796875 2.90625 -15.25 L 0.515625 -15.25 C 0.671875 -4.328125 2.40625 1.609375 5.4375 1.609375 C 8.5 1.609375 10.3125 -4.546875 10.3125 -14.890625 C 10.3125 -22.9375 9.375 -27.125 7.171875 -28.953125 L 5.3125 -30.484375 C 3.5625 -31.953125 3.0625 -33.421875 3.0625 -37.125 C 3.0625 -40.96875 3.859375 -43.421875 5.125 -43.421875 C 6.671875 -43.421875 7.53125 -40.625 7.609375 -35.453125 Z M 9.890625 -35.453125',
      'V' : 'M 6.25 0 L 10.1875 -53.578125 L 7.8125 -53.578125 L 5.3125 -13.234375 L 2.75 -53.578125 L 0.375 -53.578125 L 4.25 0 Z M 6.25 0',
      'W' : 'M 7.78125 0 L 9.9375 -53.421875 L 8.234375 -53.421875 L 7.078125 -13.34375 L 5.8125 -53.421875 L 4.234375 -53.421875 L 3.03125 -13.40625 L 1.828125 -53.421875 L 0.140625 -53.421875 L 2.328125 0 L 3.765625 0 L 5.046875 -41.703125 L 6.34375 0 Z M 7.78125 0',
      'Y' : 'M 6.59375 -19.84375 L 10.234375 -53.578125 L 7.59375 -53.578125 L 5.40625 -29.921875 L 3.0625 -53.578125 L 0.421875 -53.578125 L 4.234375 -19.84375 L 4.234375 0 L 6.59375 0 Z M 6.59375 -19.84375',
      'B' : 'M7.6 0 v 71.8 h 34.9 c 17.6 0 22.1 -11.0 22.1 -18.4 c 0 -10.3 -5.8 -13.2 -8.8 -14.7 c 8.8 -3.3 11.1 -10.3 11.1 -17.4 c 0 -5.7 -2.4 -11.1 -6.2 -14.8 c -4.1 -4.0 -8.0 -6.5 -22.7 -6.5 h -30.4 z M 22.0 31.6 v -19.2 h 18.4 c 7.3 0 11.5 3.2 11.5 10.5 c 0 6.3 -5.4 8.7 -10.8 8.7 h -19.1 z M 22.0 59.4 v -15.7 h 17.6 c 5.9 0 10.6 2.3 10.6 8.0 c 0 5.9 -4.2 7.7 -11.0 7.7 h -17.2 z',
      'J' : 'M484 718v-510c0 -152 -79 -226 -223 -226c-239 0 -239 152 -239 289h140c0 -113 8 -168 88 -168c78 0 84 50 84 105v510h150z',
      'O' : 'M44 359c0 337 250 378 345 378s345 -41 345 -378s-250 -378 -345 -378s-345 41 -345 378zM194 359c0 -201 114 -251 195 -251s195 50 195 251s-114 251 -195 251s-195 -50 -195 -251z',
      'X' : 'M419 373l234 -373h-183l-136 245l-145 -245h-175l232 367l-219 351h179l128 -232l131 232h173z',
      'Z' : 'M586 127v-127h-561v127l371 464h-361v127h549v-118l-376 -473h378z'
    };
  }
  
  /**
   * The letters G,A,C,T are encoded as constant SVG path strings
   * which undergo 'transform' operations when exposed to the data.
   *
   * Paths hacked from what comes out of the SVG export output
   * of: http://weblogo.threeplusone.com
   *
   * A single sequence is specified and plotted as a probability
   * measure, in order to get a full-height or full-information
   * residue glyph. This glyph's path is copied and pasted into this 
   * function.
   *
   * Some editing of the getLetterBaseTransform() function is 
   * required to tweak the residue positions, which do not line
   * up precisely.
   * 
   * @param {number} i - letter index.
   * @returns {string} SVG path corresponding to i. 
   */
  static get_letter_path(i) {
    switch(i) {
      case 0:
        return SequenceLogo.Logo.PATHS['A'];
      case 1:
        return SequenceLogo.Logo.PATHS['C'];
      case 2:
        return SequenceLogo.Logo.PATHS['G'];
      case 3:
        return SequenceLogo.Logo.PATHS['T'];
      case 4:
        return SequenceLogo.Logo.PATHS['U'];
      case 5:
        return SequenceLogo.Logo.PATHS['D'];
      case 6:
        return SequenceLogo.Logo.PATHS['E'];
      case 7:
        return SequenceLogo.Logo.PATHS['F'];
      case 8:
        return SequenceLogo.Logo.PATHS['H'];
      case 9:
        return SequenceLogo.Logo.PATHS['I'];
      case 10:
        return SequenceLogo.Logo.PATHS['K'];
      case 11:
        return SequenceLogo.Logo.PATHS['L'];
      case 12:
        return SequenceLogo.Logo.PATHS['M'];
      case 13:
        return SequenceLogo.Logo.PATHS['N'];
      case 14:
        return SequenceLogo.Logo.PATHS['P'];
      case 15:
        return SequenceLogo.Logo.PATHS['Q'];
      case 16:
        return SequenceLogo.Logo.PATHS['R'];
      case 17:
        return SequenceLogo.Logo.PATHS['S'];
      case 18:
        return SequenceLogo.Logo.PATHS['V'];
      case 19:
        return SequenceLogo.Logo.PATHS['W'];
      case 20:
        return SequenceLogo.Logo.PATHS['Y'];
      case 21:
        return SequenceLogo.Logo.PATHS['B'];
      case 22:
        return SequenceLogo.Logo.PATHS['J'];
      case 23:
        return SequenceLogo.Logo.PATHS['O'];
      case 24:
        return SequenceLogo.Logo.PATHS['X'];
      case 25:
        return SequenceLogo.Logo.PATHS['Z'];
      default:
        return SequenceLogo.Logo.PATHS['N'];
    }
  }
  
  /**
   * Yields nucleotide base string corresponding to given int.
   * 
   * @param {number} i
   * @returns {string} 
   */
  
  static int_to_letter(i) {
    switch (i) {
      case 0:
        return 'A';
      case 1:
        return 'C';
      case 2:
        return 'G';
      case 3:
        return 'T';
      case 4:
        return 'U';
      case 5:
        return 'D';
      case 6:
        return 'E';
      case 7:
        return 'F';
      case 8:
        return 'H';
      case 9:
        return 'I';
      case 10:
        return 'K';
      case 11:
        return 'L';
      case 12:
        return 'M';
      case 13:
        return 'N';
      case 14:
        return 'P';
      case 15:
        return 'Q';
      case 16:
        return 'R';
      case 17:
        return 'S';
      case 18:
        return 'V';
      case 19:
        return 'W';
      case 20:
        return 'Y';
      case 21:
        return 'B';
      case 22:
        return 'J';
      case 23:
        return 'O';
      case 24:
        return 'X';
      case 25:
        return 'Z';
      default:
        return 'N';
    }
  }
  
  /** 
   * 
   * Height and information content:
   *      
   * cf. `https://www.sciencedirect.com/science/article/pii/0022283686901658`
   *
   * To derive logo information from counts:
   * 
   * cf. https://github.com/WebLogo/weblogo/blob/master/weblogolib/__init__.py#L1097
   *  
   * The height of a letter is calculated as:
   *  
   *   height(b,l) = f(b,l) * R(l)
   *    
   * where f(b,l) is the frequency of residue b 
   * at position l. 
   *  
   * The stack height R(l) is the amount of 
   * information present at position l and can 
   * be quantified as follows:
   *  
   *   R(l) = log2(s) - (H(l) + e(n))
   * 
   * where log is taken base 2, H(l) is the uncertainty 
   * at position l, and e(n) is the error correction 
   * factor for small sample sizes n.
   *   
   *   H(l) = -(Sum f(b,l) * log2[f(b,l)])
   *   
   * where again, log is taken base 2. f(b,l) is the 
   * frequency of base b at position l. The sum is 
   * taken over all amino acids or bases.
   *  
   * The error correction factor e(n) is approximated by:
   * 
   *   e(n) = (s-1) / (2 * ln 2 * n)
   * 
   * where s, the number of symbols, is 4 for
   * nucleic acids (i.e., DNA).  
   */
  
  static stack_height(obj, position) {
    var alphabet_length = obj.alphabet.length;
    var max_entropy = Math.log2(alphabet_length);
    var frequencies = obj.letter_probability_matrix.frequencies[position];
    // make sure to intialize reducer, otherwise incorrect uncertainty will result
    var uncertainty = frequencies.reduce(function(t, d) {
      // cf. https://stats.stackexchange.com/questions/57069/alternative-to-shannons-entropy-when-probability-equal-to-zero
      return t + (d == 0 ? 0 : -d * Math.log2(d));
    }, 0.0);
    var nsites = obj.letter_probability_matrix.attributes.nsites;
    var error_correction_factor = ( alphabet_length - 1 ) / (( 2 * nsites ) * Math.log2(2) );
    return max_entropy - (uncertainty + error_correction_factor);
  };
   
  static update_stack_heights(obj) {
    var stack_heights = new Array(obj.letter_probability_matrix.frequencies.length);
    obj.letter_probability_matrix.frequencies.map(function(d, i) {
      stack_heights[i] = Logo.stack_height(obj, i);
    });
    obj.stack_heights = stack_heights;
  };
  
  static update_letter_heights(obj) {
    var letter_heights = new Array(obj.letter_probability_matrix.frequencies.length);
    obj.letter_probability_matrix.frequencies.map(function(frequencies, position) {
      letter_heights[position] = frequencies.map(function(frequency, idx) {
        return frequency * obj.stack_heights[position];
      }); 
    });
    obj.letter_heights = letter_heights;
  }
  
  /**
   * @param {Object} path - SVG path object.
   * @param {number[]} d - contains information about offsets.
   * @param {Object} yscale - d3 scale object.
   * @param {number} colWidth - width of each column (each nucleotide pos)
   * @param {string} type - apply letter base transformation if of certain type
   * @returns {string} transform string to be applied to the SVG path object.
   */
   
  static calculate_path_transform(path, d, yscale, colWidth, type) {
    const pathBBox = path.getBBox();
  
    /**
     * calculate scale factor based on height
     * of bounding "rectangle" (imagine a stacked bar chart)
     */
    const rectHeight = yscale(d[1] - d[0]);
    const rectWidth = colWidth;
  
    const scaleY = rectHeight / pathBBox.height;
    const scaleX = rectWidth / pathBBox.width;
  
    // transform to origin so scaling behaves as desired
    const originX = pathBBox.x;
    const originY = pathBBox.y;
  
    /**
     * base transform required by font->path conversion
     * (see getLetterBaseTransform comment)
     */
    var baseTransformX = 0;
    var baseTransformY = 0;
    if (type === 'nucleotide' || type === 'protein') {
      const baseTransforms = SequenceLogo.Logo.get_letter_base_transform(d[2]);
      baseTransformX = baseTransforms[0];
      baseTransformY = baseTransforms[1];
    }
  
    // apply scale in reverse to post-scale transforms
    const postTY = (yscale(d[0]) / scaleY) + (baseTransformY / scaleY);
    const postTX = baseTransformX / scaleX;
  
    // pre-scale transforms
    const yFudge = (type === 'epilogos') ? 0 : (type === 'protein') ? 30 : 3; // needed to align logo to zero bits
    const preTX = -originX * (scaleX - 1);
    const preTY = -originY * (scaleY - 1) - yFudge;
  
    const out = `translate(${preTX},${preTY}) scale(${scaleX},${scaleY}) translate(${postTX},${postTY})`;
  
    return out;
  }
  
  /**
   * For each index, get the transform needed so that things line up
   * correctly. This is an artifact of the font->svg path conversion 
   * used (letter paths are not even width, even in monospace fonts).
   *
   * @param {number} i - letter index.
   * @returns {number[]} baseTransform - the (x,y) transform that will 
   *  be applied to all letters.
   */
  static get_letter_base_transform(i) {
    const baseTransform = [];
    baseTransform[0] = -2;
    baseTransform[1] = 82;
  
    if (i === 3) { // letter T
      baseTransform[0] += 1;
      baseTransform[1] += 2.9;
    } 
    else if (i === 0) { // letter A
      baseTransform[0] += 1;
      baseTransform[1] += 2.5;
    }
  
    return baseTransform;
  }
  
  /**
   * Parse MEME motif string into structured object to be 
   * rendered into sequence logo
   *
   * cf. http://meme-suite.org/doc/meme-format.html
   *
   * @param {string} memeMotif
   */
   
  static parse_MEME_motif(memeMotif) {
    let result = {};
    let lines = memeMotif.split(/[\r|\n]/);
    let memeMotifObj = new SequenceLogo.MEME();
    let linesLength = lines.length;
    let versionRegex = null;
    let alphabetRegex = null;
    let strandsRegex = null;
    let backgroundFrequenciesRegex = null;
    let motifNameRegex = null;
    let urlRegex = null;
    let letterProbabilityRegex = null;
    for (var idx = 0; idx < linesLength; ++idx) {
      var line = lines[idx];
      if (line.length == 0) {
        continue;
      }
      else {
        if (versionRegex = line.match(/^MEME version ([0-9.]{1,})$/) || null) {
          memeMotifObj.version = parseFloat(versionRegex[1]);
        }
        else if (alphabetRegex = line.match(/^ALPHABET= ([A-Z]{1,})$/) || null) {
          memeMotifObj.alphabet = alphabetRegex[1].split('');
        }
        else if (strandsRegex = line.match(/^strands: ([\+\s\-]+)$/) || null) {
          memeMotifObj.strands = strandsRegex[1].split(' ');
        }
        else if (backgroundFrequenciesRegex = line.match(/^Background letter frequencies/) || null) {
          idx++;
          line = lines[idx];
          var freqPairingsObj = {};
          if (line.length == 0) {
            // assume uniform frequencies
            var freqPairingsLength = memeMotifObj.alphabet.length;
            for (var fpi = 0; fpi < freqPairingsLength; ++fpi) {
              freqPairingsObj[memeMotifObj.alphabet[fpi]] = 1/freqPairingsLength;
            }
          }
          else {
            var freqPairings = line.split(' ');
            var freqPairingsLength = freqPairings.length;
            for (var fpi = 0; fpi < freqPairingsLength; ++fpi) {
              if (fpi % 2 == 0) {
                var letter = freqPairings[fpi];
              }
              else {
                var frequency = parseFloat(freqPairings[fpi]);
                freqPairingsObj[letter] = frequency;
              }
            }  
          }        
          memeMotifObj.background_frequencies = freqPairingsObj;
        }
        else if (motifNameRegex = line.match(/^MOTIF ([A-Za-z0-9\-\s_.,!"'/$]+)$/) || null) {
          var motifNames = motifNameRegex[1].split(" ");
          memeMotifObj.identifier = motifNames[0];
          if (motifNames.length == 2) {
            memeMotifObj.alternate_name = motifNames[1];
          }
        }
        else if (urlRegex = line.match(/https?:\/\/\S+/gi) || null) {
          memeMotifObj.url = urlRegex[0];
        }
        else if (letterProbabilityRegex = line.match(/^letter-probability matrix: ([A-Za-z\=\s0-9].*)$/) || null) {
          // parse any match, if found
          if (letterProbabilityRegex[1].length > 0) {
            var lprPairings = letterProbabilityRegex[1].split(" ");
            var lprPairingsLength = lprPairings.length;
            var lprPairingsObj = {};
            for (var lpri = 0; lpri < lprPairingsLength; ++lpri) {
              if ((lpri % 2) == 0) {
                var keyStr = lprPairings[lpri];
                var key = keyStr.substring(0, keyStr.length - 1);
              }
              else {
                var value =  lprPairings[lpri];
                lprPairingsObj[key] = parseFloat(value);
              }
            }
            // defaults
            if (!lprPairingsObj.nsites) {
              lprPairingsObj.nsites = 20;
              lprPairingsObj.E = 0;
            }
            memeMotifObj.letter_probability_matrix = {};
            memeMotifObj.letter_probability_matrix['attributes'] = lprPairingsObj;
          }
          // in any case, parse lines until a blank line is found, and then continue out of loop
          idx++;
          line = lines[idx];
          var lineLength = line.length;
          memeMotifObj.letter_probability_matrix['frequencies'] = [];
          while (lineLength != 0) {
            var lprFrequencies = line.trim().split(/\s+/);
            var lprFrequenciesLength = lprFrequencies.length;
            var alphabetLength = memeMotifObj.alphabet.length || memeMotifObj.letter_probability_matrix.attributes.alength;
            var lprFrequenciesArray = [];
            for (var ai = 0; ai < alphabetLength; ++ai) {
              lprFrequenciesArray.push(parseFloat(lprFrequencies[ai]));
            }
            memeMotifObj.letter_probability_matrix.frequencies.push(lprFrequenciesArray);
            idx++;
            line = lines[idx];
            if (!line) {
              break;
            }
            lineLength = line.length;
          }
        }
      }
    }
    
    // update state
    memeMotifObj.update_state();
    
    return memeMotifObj;
  }
  
  /**
   * Parse FASTA string into structured object to be 
   * rendered into sequence logo
   *
   * @param {string} fasta
   */
  
  static parse_FASTA(fasta) {
    let records = [];
    let alphabetObj = {};
    let identifier = fasta.identifier;
    let lines = fasta.sequences.split(/[\r\n]/);
    let fastaObj = new SequenceLogo.FASTA();
    let linesLength = lines.length;
    let recordSet = false;
    let record = { 'header' : null , 'sequence' : null};
    let sequenceLength = 0;
    let headerRegex = null;
    for (var idx = 0; idx < linesLength; ++idx) {
      var line = lines[idx].trim();
      if (line.length == 0) {
        continue;
      }
      else {
        if (headerRegex = line.match(/^>(.*)$/) || null) {
          var header = headerRegex[1];
          if (recordSet && record.sequence.length > 0) {
            if ((sequenceLength != 0) && (sequenceLength != record.sequence.length)) {
              throw new SyntaxError('Invalid sequence length for record:' + JSON.stringify(record));
            }
            sequenceLength = record.sequence.length;
            records.push(record);
          }
          record = { 'header' : null , 'sequence' : null};
          record.header = header;
          record.sequence = '';
          recordSet = true;
        }
        else {
          do {
            var sequence = line.toUpperCase().trim().replace(/ /g, "").replace(/-/g, "N");
            var residues = sequence.split('');
            residues.forEach(d => alphabetObj[d] = true);
            record.sequence += sequence;
            if (idx == linesLength - 1) {
              records.push(record);
              break;
            } 
            idx++;
            line = lines[idx];
          } while (!line.startsWith('>'))
          idx--;
          headerRegex = line.match(/^>(.*)$/) || null;
        }
      }
    }
    if (record.sequence.length > 0) {
      records.push(record);
    }
            
    // build frequency table
    var countTable = [];
    for (var idx = 0; idx < sequenceLength; ++idx) {
      countTable[idx] = {};
      Object.keys(alphabetObj).forEach(d => countTable[idx][d] = 0);
    }
    var recordsLength = records.length;
    for (var idx = 0; idx < recordsLength; ++idx) {
      records[idx].sequence.split('').forEach((d,i) => countTable[i][d]++);
    }
    var alphabet = [];
    Object.keys(alphabetObj).forEach(d => alphabet.push(d));
    var alphabetLength = alphabet.length;
    fastaObj.letter_probability_matrix['attributes'] = {'nsites' : recordsLength};
    fastaObj.letter_probability_matrix['frequencies'] = [];
    for (var idx = 0; idx < sequenceLength; ++idx) {
      var lprFrequenciesArray = new Array(alphabetLength);
      alphabet.forEach((d,i) => lprFrequenciesArray[i] = parseFloat(countTable[idx][d]) / recordsLength)
      fastaObj.letter_probability_matrix.frequencies.push(lprFrequenciesArray);
    }
    
    // populate object
    fastaObj.records = records;
    fastaObj.alphabet = alphabet;
    fastaObj.identifier = identifier;
    
    // update state with letter and stack heights
    fastaObj.update_state();
    
    return fastaObj;
  }
  
  static object_offsets(position, alphabet, letter_heights, stack_height, max_entropy) {
    const offs = [];
    let ctr = 0;
    letter_heights.forEach((d, j) => {
      const nextCtr = ctr + d;
      offs.push([ctr, nextCtr,  (nextCtr - ctr), j]);
      ctr = nextCtr;
    });
    // sort by heights of produced rects
    offs.sort((a, b) => (b[2] - a[2]));
    const outOffsets = [];
    ctr = max_entropy - stack_height;
    offs.forEach((d) => {
      const diff = d[2];
      outOffsets.push([ ctr, ctr + diff, SequenceLogo.Logo.MAPPING[alphabet[d[3]]] ]);
      ctr += diff;
    });
    return outOffsets;
  }
  
  /**
   * Entry point for all functionality by MEME motif or FASTA object.
   *
   * @param {SequenceLogo.MEME} obj || @param {SequenceLogo.FASTA} obj
   * @param {Object} display attributes
   */
   
  static render_sequence_object(obj, attr) {
    
    // number of symbols
    const n = obj.alphabet.length;
    
    // number of nucleotides over sequence
    const m = obj.letter_heights.length; 
    
    // range of letter bounds at each nucleotide index position
    //const max_entropy = parseInt(Math.ceil(Math.log2(n)));
    const max_entropy = Math.log2(n);
    const yz = d3.range(m).map(i => SequenceLogo.Logo.object_offsets(i, obj.alphabet, obj.letter_heights[i], obj.stack_heights[i], max_entropy));
    
    // margin
    var margin = {
      top: 20, 
      right: 0, 
      bottom: 10, 
      left: 25
    };
    
    // width including endpoint markers
    const svgFullWidth = attr.svg_width;
  
    // width of just the base letters + x-axis labels
    const svgLetterWidth = attr.svg_letter_width;
  
    const endpointWidth = (svgFullWidth - svgLetterWidth) / 2;
  
    // height including x-axis labels and endpoint markers
    const svgFullHeight = attr.svg_height;
  
    // height of just the base letters
    const svgLetterHeight = attr.svg_letter_height;
  
    // map: sequence length -> innerSVG
    const xscale = d3.scaleLinear()
      .domain([0, m])
      .range([endpointWidth, svgLetterWidth + endpointWidth]);
    
    // get one unit of width from d3 scale (convenience)
    const colWidth = (xscale(1) - xscale(0));
    
    // map: log2 number of symbols -> svg letter height (i.e., information in bits)
    const yScale = d3.scaleLinear()
      .domain([0, max_entropy])
      .range([0, svgLetterHeight]);
      
    const yAxisScale = d3.scaleLinear()
      .domain([0, max_entropy])
      .range([svgLetterHeight, 0]);
      
    const svg = d3.select('#main')
      .append('svg')
      .attr("width", svgFullWidth + margin.left + margin.right)
      .attr("height", svgFullHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    // Attach title
    const titleGroup = svg.append('g')
      .attr('class', 'title');
      
    const titleFontSize = 18;
    const titleFontWeight = 'bold';
  
    titleGroup.append('text')
      .text(obj.identifier)
      .style('text-anchor', 'middle')
      .style('font-size', titleFontSize)
      .style('font-weight', titleFontWeight)
      .attr('transform', `translate(${(svgFullWidth-margin.left-margin.right)/2.0},${0})`);
  
    // Attach y-axis (bits)
    const yAxisGroup = svg.append('g')
      .attr('class', 'y axis');
    
    const yAxisFontSize = 18;
      
    yAxisGroup.append('text')
      .text('bits')
      .style('text-anchor', 'left')
      .style('font-size', yAxisFontSize)
      .attr('transform', `translate(0,${(svgLetterHeight+margin.top+margin.bottom)/2.0}) rotate(270)`);
      
    yAxisGroup.append('g')
      .attr("transform", "translate(30,0)")
  		.call(d3.axisLeft(yAxisScale).ticks(2));
  
    const endptFontSize = 18;
    const endptFontWeight = 'bold';
    const endptTY = (svgFullHeight + svgLetterHeight) / 2 - 10;
  
    // Attach left endpoint to SVG
    svg.append('text')
      .text('5\'')
      .style('text-anchor', 'begin')
      .style('font-size', endptFontSize)
      .style('font-weight', endptFontWeight)
      .attr('transform', `translate(${15},${endptTY})`);
  
    // Attach right endpoint to SVG
    svg.append('text')
      .text('3\'')
      .style('text-anchor', 'end')
      .style('font-size', endptFontSize)
      .style('font-weight', endptFontWeight)
      .attr('transform', `translate(${svgFullWidth-15},${endptTY})`);
      
    /**
     * Our groups are organized by columns--
     * each column gets an SVG group.
     * 
     * The column is used to neatly handle all x-offsets and labels.
     */
    const group = svg.selectAll('group')
      .data(yz)
      .enter()
      .append('g')
      .attr('class', 'column')
      .attr('transform', (d, i) => `translate(${xscale(i)},0)`);
      
    /**
     * Attach the number labels to the x-axis.
     * 
     * A possible modification is to make xLabelFontSize 
     * data-dependent. As written its position will change 
     * with the column width (# of nucleotides), so 
     * visually it will look fine, but it may be 
     * desirable to alter font size as well.
     */
    const xLabelFontSize = 18;
    const xLabelTX = (colWidth / 2) + (xLabelFontSize / 3);
    const xLabelTY = svgLetterHeight + 10;
  
    group.append('text')
      .text((d, i) => `${i + 1}`)
      .style('font-size', xLabelFontSize)
      .style('text-anchor', 'end')
      .attr('transform', `translate(${xLabelTX}, ${xLabelTY}) rotate(270)`);
      
    if (attr.type === 'nucleotide' || attr.type === 'protein') {
      /*
       * For each column (group):
       *  Add the letter (represented as an SVG path, see above)
       *  if the calculated height is nonzero (the filter condition).
       *
       * In other words, if that base appeared at this position
       * in at least one sequence.
       *
       * notes:
       *  Filter is used here to avoid attaching paths with 0 size
       *  to the DOM. This filtering could optionally be performed 
       *  earlier, when we build yz.
       */
      group.selectAll('path')
        .data(d => d)
        .enter()
        .filter(d => (d[1] - d[0] > 0))
        .append('path')
        .attr('d', d => SequenceLogo.Logo.get_letter_path(d[2]))
        .style('fill', d => SequenceLogo.Logo.COLOR_SCHEMES[attr.color_scheme][SequenceLogo.Logo.int_to_letter(d[2])])
        .attr('transform', function(d) { return SequenceLogo.Logo.calculate_path_transform(this, d, yScale, colWidth, attr.type); });  
    }
    else if (attr.type === 'epilogos') {
      group.selectAll('rect')
        .data(d => d)
        .enter()
        .filter(d => (d[1] - d[0] > 0))
        .append('rect')
        .attr('width', colWidth)
        .attr('height', d => yScale(d[1] - d[0]))
        .style('fill', d => SequenceLogo.Logo.COLOR_SCHEMES[attr.color_scheme][SequenceLogo.Logo.int_to_letter(d[2])])
        .attr('transform', function(d) { return SequenceLogo.Logo.calculate_path_transform(this, d, yScale, colWidth, attr.type); });
    }    
  }
  
  /**
   * Get a random integer within range of min and max, inclusive
   *
   * @param {number} min
   * @param {number} max
   */
  
  static get_random_int(min, max) {
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
  }
  
  /**
   * Retrieve a random element from an array
   *
   * @param {Array} arr
   */
  
  static random_element(arr) {
    var randomIndex = SequenceLogo.Logo.get_random_int(0, arr.length - 1);
    return arr[randomIndex];
  }
  
  /**
   * Re-render the SVG logo given the specified item and
   * type, using the type to select a type-specific parser. If 
   * the item is an array, sample an element from this array
   * and use the sampled item for rendering.
   *
   * @param {string[] | string} item
   * @param {string} mode
   * @param {string} type
   */
  
  refresh_SVG(item, mode, type) {
    // grab a random item if passed an array of items
    if (Array.isArray(item)) {
      item = SequenceLogo.Logo.random_element(item);
      // update item and mode in object state
      this.item = item;
      this.mode = mode;
      this.type = type;
    }
    
    // use parser for specified mode
    this.seq_obj = SequenceLogo.Logo.MODE_PARSERS[mode](item);
    
    // clear old SVG content
    const svg = d3.select('svg');
    if (svg) {
      svg.remove();
    }
    
    // render
    SequenceLogo.Logo.render_sequence_object(this.seq_obj, this.display_attributes());
  }
}