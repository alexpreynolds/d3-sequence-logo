/**
 * File: sequence_logo.js
 * Author: Sam Lichtenberg (splichte@gmail.com)
 *
 * This file implements sequence logo generation for 
 * bounded sequences in d3.
 *
 * See `https://en.wikipedia.org/wiki/Sequence_logo` 
 * for more information.
 *
 * Usage (see `index.html` for example):
 *  (1) define sequence number and length bounds
 *  (2) define sequence data
 *  (3) call entry_point with (1) and (2).
 */


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
    baseTransform[1] += 2.0;
  } else if (i === 1) { // letter A
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
 * residue glyph. This is copied and pasted into this function.
 *
 * Some editing of the getLetterBaseTransform() function is 
 * required to tweak the residue positions, which do not line
 * up exactly.
 * 
 * @param {number} i - letter index. Range: [0,4)
 * @returns {string} SVG path corresponding to i. 
 */
function getLetterPath(i) {
  const letterA = 'M 11.21875 -16.1875 L 12.296875 0 L 15.734375 0 L 10.09375 -80.265625 L 6.375 -80.265625 L 0.578125 0 L 4.015625 0 L 5.109375 -16.1875 Z M 10.296875 -29.953125 L 6.046875 -29.953125 L 8.171875 -61.328125 Z M 10.296875 -29.953125';

  const letterG = 'M 16.1875 -41.375 L 9.53125 -41.375 L 9.53125 -28.1875 L 13.3125 -28.1875 C 13.234375 -23.859375 13 -21.21875 12.5 -18.46875 C 11.671875 -13.828125 10.421875 -11.078125 9.109375 -11.078125 C 6.359375 -11.078125 4.375 -22.265625 4.375 -38.109375 C 4.375 -54.671875 6.125 -64.703125 9.015625 -64.703125 C 10.203125 -64.703125 11.203125 -63.109375 11.953125 -60.0625 C 12.4375 -58.15625 12.6875 -56.359375 12.96875 -52.34375 L 16.1875 -52.34375 C 15.78125 -68.1875 13 -78.203125 9 -78.203125 C 4.21875 -78.203125 0.953125 -61.84375 0.953125 -37.890625 C 0.953125 -14.5625 4.234375 2.421875 8.71875 2.421875 C 10.953125 2.421875 12.453125 -1.265625 13.734375 -9.921875 L 14.140625 0.21875 L 16.1875 0.21875 Z M 16.1875 -41.375';

  const letterT = 'M 10.015625 -66.734375 L 15.5625 -66.734375 L 15.5625 -80.546875 L 0.359375 -80.546875 L 0.359375 -66.734375 L 6.125 -66.734375 L 6.125 0 L 10.015625 0 Z M 10.015625 -66.734375';

  const letterC = 'M 16.171875 -50.734375 C 16.046875 -57.375 15.734375 -61.578125 15 -65.890625 C 13.671875 -73.6875 11.546875 -78 8.953125 -78 C 4.078125 -78 1.046875 -62.53125 1.046875 -37.6875 C 1.046875 -13.046875 4.046875 2.421875 8.859375 2.421875 C 13.15625 2.421875 16.015625 -8.625 16.234375 -26.21875 L 12.78125 -26.21875 C 12.5625 -16.421875 11.171875 -10.84375 8.953125 -10.84375 C 6.203125 -10.84375 4.59375 -20.734375 4.59375 -37.46875 C 4.59375 -54.421875 6.28125 -64.53125 9.078125 -64.53125 C 10.3125 -64.53125 11.328125 -62.640625 12 -58.953125 C 12.375 -56.84375 12.5625 -54.84375 12.78125 -50.734375 Z M 16.171875 -50.734375';

  if (i === 0) {
    return letterG;
  } else if (i === 1) {
    return letterA;
  } else if (i === 2) {
    return letterC;
  } else if (i === 3) {
    return letterT;
  }
  return null;
}

/**
 * @param {string[]} s - sequence data. An array of equal-length strings.
 * @param {number} i - letter index. Range: [0,4)
 * @returns {number[]} counts of each letter. 
 */
function getLetterCnts(s, i) {
  const dict = { G: 0,
    A: 0,
    C: 0,
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
    return 'G';
  } else if (i === 1) {
    return 'A';
  } else if (i === 2) {
    return 'C';
  } else if (i === 3) {
    return 'T';
  }
  return null;
}

/**
 * Standard, from MDN.
 * Returns a random integer between min (inclusive) and max 
 * (inclusive)
 * 
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}


/**
 * Generate random sequences by sampling from DiscreteUniform(0,4). 
 *
 * A different approach could be to favor some bases more 
 * than others at different positions by modeling the 
 * distribution P(base | position) as a categorical that 
 * has its parameters sampled from a Dirichlet.
 *
 * @param {number[]} seqLenBounds
 * @param {number[]} seqNumBounds
 * @returns {string[]} seqData
 */
function getRandomData(seqLenBounds, seqNumBounds) {
  const seqLen = getRandomInt(seqLenBounds[0], seqLenBounds[1]);
  const seqNum = getRandomInt(seqNumBounds[0], seqNumBounds[1]);

  const seqData = [];

  for (let i = 0; i < seqNum; i += 1) {
    const thisSeq = [];
    for (let j = 0; j < seqLen; j += 1) {
      // upper bound is inclusive (getRandomInt)
      const newLetter = intToLetter(getRandomInt(0, 3));
      thisSeq.push(newLetter);
    }
    seqData.push(thisSeq.join(''));
  }

  return seqData;
}

/**
 * Entry point for all functionality.
 *
 * @param {string[]} sequenceData
 * @param {number[]} seqLenBounds
 * @param {number[]} seqNumBounds
 */
function entryPoint(sequenceData, seqLenBounds, seqNumBounds) {
  const isValid = isValidData(sequenceData, seqLenBounds, seqNumBounds);

  if (!isValid) {
    return;
  }

  // number of sequences
  const n = sequenceData.length;

  // number of nucleotides per sequence
  const m = d3.max(sequenceData, d => d.length);

  // range of letter bounds at each nucleotide index position
  const yz = d3.range(m).map(i => offsets(sequenceData, i));

  /**
   * Next, we set local values that govern visual appearance.
   * 
   * We define width/height here, rather than in the HTML,
   * so one can easily switch the code to modify svg size 
   * based on the data if desired.
   */

  // width including endpoint markers
  const svgFullWidth = 550;

  // width of just the base letters + x-axis labels
  const svgLetterWidth = 500;

  const endpointWidth = (svgFullWidth - svgLetterWidth) / 2;

  // height including x-axis labels and endpoint markers
  const svgFullHeight = 250;

  // height of just the base letters
  const svgLetterHeight = 150;

  const colors = d3.scaleOrdinal(d3.schemeCategory10);

  // map: sequence length -> innerSVG
  const xscale = d3.scaleLinear().domain([0, m])
    .range([endpointWidth, svgLetterWidth + endpointWidth]);

  // get one unit of width from d3 scale (convenience)
  const colWidth = (xscale(1) - xscale(0));

  // map: number of sequences -> svg letter height
  const yscale = d3.scaleLinear().domain([0, n]).range([0, svgLetterHeight]);

  const svg = d3.select('#main')
    .append('svg')
    .attr('width', svgFullWidth)
    .attr('height', svgFullHeight);

  const endptFontSize = 32;

  const endptTY = (svgFullHeight + svgLetterHeight) / 2;

  // Attach left endpoint to SVG
  svg.append('text')
    .text('5\'')
    .style('text-anchor', 'begin')
    .style('font-size', endptFontSize)
    .attr('transform', `translate(0,${endptTY})`);

  // Attach right endpoint to SVG
  svg.append('text')
    .text('3\'')
    .style('text-anchor', 'end')
    .style('font-size', endptFontSize)
    .attr('transform', `translate(${svgFullWidth},${endptTY})`);


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
  const xLabelFontSize = 20;
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
    .style('fill', d => colors(d[2]))
    .attr('transform', function (d) { return calcPathTransform(this, d, yscale, colWidth); });
}

/**
 * Get random sequence data, then call entry point.
 *
 * @param {number[]} seqLenBounds
 * @param {number[]} seqNumBounds
 */
function refreshSVG(seqLenBounds, seqNumBounds) {
  const sequenceData = getRandomData(seqLenBounds, seqNumBounds);

  // clear SVG if it exists
  const svg = d3.select('svg');

  if (svg) {
    svg.remove();
  }

  entryPoint(sequenceData, seqLenBounds, seqNumBounds);
}

