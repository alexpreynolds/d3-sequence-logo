/**
 * File: sequence_logo.js
 *
 * Sequence parsing and d3 rendering: Sam Lichtenberg (splichte@gmail.com)
 * MEME and FASTA parsing and related d3 rendering: Alex Reynolds 
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
  static get INPUT_PARSERS() {
    return {
      'FASTA' : 'parseFasta',
      'MEME' : 'parseMEMEMotif'
    }
  }
  static get MAPPING() {
    return {
      'A' : 0,
      'C' : 1,
      'G' : 2,
      'T' : 3
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
      }
    }; 
  }
  static get PATHS() {
    return {
      'A' : 'M 11.21875 -16.1875 L 12.296875 0 L 15.734375 0 L 10.09375 -80.265625 L 6.375 -80.265625 L 0.578125 0 L 4.015625 0 L 5.109375 -16.1875 Z M 10.296875 -29.953125 L 6.046875 -29.953125 L 8.171875 -61.328125 Z M 10.296875 -29.953125',
      'C' : 'M 16.171875 -50.734375 C 16.046875 -57.375 15.734375 -61.578125 15 -65.890625 C 13.671875 -73.6875 11.546875 -78 8.953125 -78 C 4.078125 -78 1.046875 -62.53125 1.046875 -37.6875 C 1.046875 -13.046875 4.046875 2.421875 8.859375 2.421875 C 13.15625 2.421875 16.015625 -8.625 16.234375 -26.21875 L 12.78125 -26.21875 C 12.5625 -16.421875 11.171875 -10.84375 8.953125 -10.84375 C 6.203125 -10.84375 4.59375 -20.734375 4.59375 -37.46875 C 4.59375 -54.421875 6.28125 -64.53125 9.078125 -64.53125 C 10.3125 -64.53125 11.328125 -62.640625 12 -58.953125 C 12.375 -56.84375 12.5625 -54.84375 12.78125 -50.734375 Z M 16.171875 -50.734375',
      'T' : 'M 10.015625 -66.734375 L 15.5625 -66.734375 L 15.5625 -80.546875 L 0.359375 -80.546875 L 0.359375 -66.734375 L 6.125 -66.734375 L 6.125 0 L 10.015625 0 Z M 10.015625 -66.734375',
      'G' : 'M 16.1875 -41.375 L 9.53125 -41.375 L 9.53125 -28.1875 L 13.3125 -28.1875 C 13.234375 -23.859375 13 -21.21875 12.5 -18.46875 C 11.671875 -13.828125 10.421875 -11.078125 9.109375 -11.078125 C 6.359375 -11.078125 4.375 -22.265625 4.375 -38.109375 C 4.375 -54.671875 6.125 -64.703125 9.015625 -64.703125 C 10.203125 -64.703125 11.203125 -63.109375 11.953125 -60.0625 C 12.4375 -58.15625 12.6875 -56.359375 12.96875 -52.34375 L 16.1875 -52.34375 C 15.78125 -68.1875 13 -78.203125 9 -78.203125 C 4.21875 -78.203125 0.953125 -61.84375 0.953125 -37.890625 C 0.953125 -14.5625 4.234375 2.421875 8.71875 2.421875 C 10.953125 2.421875 12.453125 -1.265625 13.734375 -9.921875 L 14.140625 0.21875 L 16.1875 0.21875 Z M 16.1875 -41.375'
    };
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
 *   R(l) for nucleic acids = log2(4) - (H(l) + e(n))
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
}

function UserException(message) {
  this.message = message;
  this.name = 'UserException';
}

/**
 * For each index, get the transform needed so that things line up
 * correctly. This is an artifact of the font->svg path conversion 
 * used (letter paths are not even width, even in monospace fonts).
 *
 * @param {number} i - letter index. Range: [0,4)
 * @returns {number[]} baseTransform - the (x,y) transform that will 
 *  be applied to all letters.
 */
function getLetterBaseTransform(i) {
  const baseTransform = [];
  baseTransform[0] = -2;
  baseTransform[1] = 82;

  if (i === 3) { // letter T
    baseTransform[0] += 1;
    baseTransform[1] += 2.9;
  } else if (i === 0) { // letter A
    baseTransform[0] += 1;
    baseTransform[1] += 2.5;
  }

  return baseTransform;
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
 * In the future, we might extend the alphabet to support epilogos
 * and protein residues. For now, we focus on a basic set of 
 * nucleotides.
 * 
 * @param {number} i - letter index. Range: [0,4)
 * @returns {string} SVG path corresponding to i. 
 */
function getLetterPath(i) {
  if (i === 0) {
    return SequenceLogo.Logo.PATHS['A'];
  } else if (i === 1) {
    return SequenceLogo.Logo.PATHS['C'];
  } else if (i === 2) {
    return SequenceLogo.Logo.PATHS['G'];
  } else if (i === 3) {
    return SequenceLogo.Logo.PATHS['T'];
  }
  return null;
}

/**
 * @param {string[]} s - sequence data. An array of equal-length strings.
 * @param {number} i - letter index. Range: [0,4)
 * @returns {number[]} counts of each letter. 
 */
function getLetterCnts(s, i) {
  const dict = { A: 0,
    C: 0,
    G: 0,
    T: 0 };

  s.forEach((d) => {
    dict[d[i]] += 1;
  });

  const out = Object.keys(dict).map(key => dict[key]);
  return out;
}

/**
 * @param {string[]} s - sequence data. An array of equal-length strings.
 * @param {number} i - letter index. Range: [0,4)
 * @returns {number[][]} counts of each letter. 
 */
function offsets(s, i) {
  const cnts = getLetterCnts(s, i);
  const offs = [];

  let ctr = 0;

  // add on the index so we can use it.
  // determine heights of rects
  cnts.forEach((d, j) => {
    const nextCtr = ctr + d;

    // -(nextCtr-ctr) is for sorting
    offs.push([ctr, nextCtr, (nextCtr - ctr), j]);
    ctr = nextCtr;
  });


  // sort by heights of produced rects
  offs.sort((a, b) => (b[2] - a[2]));

  // re-arrange data structure based on sort
  const outOffsets = [];
  ctr = 0;
  offs.forEach((d) => {
    const diff = d[2];
    outOffsets.push([ctr, ctr + diff, d[3]]);
    ctr += diff;
  });

  return outOffsets;
}

/**
 * @param {Object} path - SVG path object.
 * @param {number[]} d - contains information about offsets.
 * @param {Object} yscale - d3 scale object.
 * @param {number} colWidth - width of each column (each nucleotide pos)
 * @returns {string} transform string to be applied to the SVG path object.
 */
function calcPathTransform(path, d, yscale, colWidth) {
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
  const baseTransforms = getLetterBaseTransform(d[2]);
  const baseTransformX = baseTransforms[0];
  const baseTransformY = baseTransforms[1];

  // apply scale in reverse to post-scale transforms
  const postTY = (yscale(d[0]) / scaleY) + (baseTransformY / scaleY);
  const postTX = baseTransformX / scaleX;

  // pre-scale transforms
  const preTX = -originX * (scaleX - 1);
  const preTY = -originY * (scaleY - 1);

  const out = `translate(${preTX},${preTY}) scale(${scaleX},${scaleY}) translate(${postTX},${postTY})`;

  return out;
}

/**
 * Checks that sequence data obeys bounds, and that each 
 * sequence has the same length.
 *
 * Possible change is to create more informative error msg.
 *
 * @param {string[]} data - sequenceData
 * @param {number[]} seqLenBounds - lower/upper bounds for 
 *  number of bases in a sequence.
 * @param {number[]} seqNumBounds - lower/upper bounds for 
 *  number of sequences.
 * @returns {boolean} true/false - does the data conform?
 */
function isValidData(data, seqLenBounds, seqNumBounds) {
  const n = data.length;

  if (n > seqNumBounds[1] || n < seqNumBounds[0]) {
    return false;
  }
  const m0 = d3.min(data, d => d.length);
  const m1 = d3.max(data, d => d.length);

  if (m0 !== m1) {
    return false;
  }
  // m == m0 == m1
  const m = m0;

  if (m > seqLenBounds[1] || m < seqLenBounds[0]) {
    return false;
  }
  return true;
}

/**
 * Yields nucleotide base string corresponding to given int.
 * 
 * @param {number} i
 * @returns {string} 
 */

function intToLetter(i) {
  if (i === 0) {
    return 'A';
  } else if (i === 1) {
    return 'C';
  } else if (i === 2) {
    return 'G';
  } else if (i === 3) {
    return 'T';
  }
  return null;
}

/**
 * Parse MEME motif string into structured object to be 
 * rendered into sequence logo
 *
 * cf. http://meme-suite.org/doc/meme-format.html
 *
 * @param {string} memeMotif
 */
 
function parseMEMEMotif(memeMotif) {
  let result = {};
  let lines = memeMotif.split(/[\r|\n]/);
  let memeMotifObj = new SequenceLogo.MEME();
  let linesLength = lines.length;
  for (var idx = 0; idx < linesLength; ++idx) {
    var line = lines[idx];
    if (line.length == 0) {
      continue;
    }
    else {
      if (versionRegex = line.match(/^MEME version ([0-9.]{1,})$/) || null) {
        memeMotifObj.version = parseFloat(versionRegex[1]);
      }
      else if (alphabetRegex = line.match(/^ALPHABET= ([ACGTN]{1,})$/) || null) {
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

function objectOffsets(position, alphabet, letter_heights, stack_height, max_entropy) {
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
 */
function renderObject(obj) {
  
  // number of symbols
  const n = obj.alphabet.length;
  
  // number of nucleotides over sequence
  const m = obj.letter_heights.length; 
  
  // range of letter bounds at each nucleotide index position
  const max_entropy = Math.log2(n);
  const yz = d3.range(m).map(i => objectOffsets(i, obj.alphabet, obj.letter_heights[i], obj.stack_heights[i], max_entropy));
  
  // margin
  var margin = {top: 20, right: 0, bottom: 10, left: 25};
  
  // width including endpoint markers
  const svgFullWidth = 550;

  // width of just the base letters + x-axis labels
  const svgLetterWidth = 460;

  const endpointWidth = (svgFullWidth - svgLetterWidth) / 2;

  // height including x-axis labels and endpoint markers
  const svgFullHeight = 250;

  // height of just the base letters
  const svgLetterHeight = 160;

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
    .attr('d', d => getLetterPath(d[2]))
    .style('fill', function(d) { return SequenceLogo.Logo.COLOR_SCHEMES['nucleotide'][intToLetter(d[2])]; })
    .attr('transform', function (d) { return calcPathTransform(this, d, yScale, colWidth); });
}

/**
 * Parse FASTA string into structured object to be 
 * rendered into sequence logo
 *
 * @param {string} fasta
 */

function parseFasta(fasta) {
  let records = [];
  let alphabetObj = {};
  let identifier = fasta.identifier;
  let lines = fasta.sequences.split(/[\r|\n]/);
  let fastaObj = new SequenceLogo.FASTA();
  let linesLength = lines.length;
  let recordSet = false;
  let record = { 'header' : null , 'sequence' : null};
  let sequenceLength = 0;
  for (var idx = 0; idx < linesLength; ++idx) {
    var line = lines[idx];
    if (line.length == 0) {
      continue;
    }
    else {
      if (headerRegex = line.match(/^>(.*)$/) || null) {
        var header = headerRegex[1];
        if (recordSet && record.sequence.length > 0) {
          if ((sequenceLength != 0) && (sequenceLength != record.sequence.length)) {
            throw new UserException('Invalid sequence length for record', JSON.stringify(record));
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
          var sequence = line.toUpperCase();
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

/**
 * Get a random integer within range of min and max, inclusive
 *
 * @param {number} min
 * @param {number} max
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

/**
 * Retrieve a random element from an array
 *
 * @param {Array} arr
 */

function randomElement(arr) {
  var randomIndex = getRandomInt(0, arr.length - 1);
  return arr[randomIndex];
}

/**
 * Re-render the SVG logo given the specified item and
 * type, using the type to select a type-specific parser. If 
 * the item is an array, sample an element from this array
 * and use the sampled item for rendering.
 *
 * @param {string[] | string} item
 * @param {string} type
 */

function refreshSVG(item, type) {
  if (Array.isArray(item)) {
    item = randomElement(item);
  }
  // use parser for specified type
  let obj = window[SequenceLogo.Logo.INPUT_PARSERS[type]](item);
  const svg = d3.select('svg');
  if (svg) {
    svg.remove();
  }
  renderObject(obj);
}