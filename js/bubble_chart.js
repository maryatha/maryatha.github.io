/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Refered to a public tutorial
 * https://github.com/vlandham/bubble_chart_v4/
 */
// Load the data.
d3.csv('data/boardgames.csv', display);

// setup the buttons.
setupButtons();

function bubbleChart() {
  // Constants for sizing
  var width = 1500;
  var height = 1000;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('gates_tooltip', 240, 20);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  var stateCenters = {
    Family: { x: width / 5, y:  1.2 * height / 3},
    Strategy: { x: 14 * width / 40, y: 6.5 * height / 20 },
    Party: { x: 12 * width / 20, y: height / 3.5 },
    Thematic: { x: 9 * width / 20, y: height / 3 },
    Uncategorized: { x: 13 * width / 16, y: height / 3 }
  }

  var quartileCenters = {
    Q1: { x: width / 4, y:  1.2 * height / 3},
    Q2: { x: 14 * width / 40, y: 6.5 * height / 20 },
    Q3: { x: 12 * width / 20, y: height / 3.5 },
    Q4: { x: 9 * width / 20, y: height / 3 }
  }

  var starCenters = {
    3: { x: width / 4, y: 2 * height / 5 },
    4: { x: 6 * width / 8, y: 2* height / 5 }
  }

  var stateTitle = {
    Family: { x: width *0.1, y: 6.5 * height / 8},
    Strategy: { x: 14 * width / 40, y: 6.5 * height / 8 },
    Thematic: { x: width * 0.6, y: 6.5 * height / 8 },
    Party: { x: width *.75, y: 6.5 * height / 8 },
    Uncategorized: { x: width * 0.92, y: 6.5 * height / 8 }
  }

  var quartileTitle = {
    Q1: { x: width *0.1, y: 6.5 * height / 8},
    Q2: { x: 14 * width / 40, y: 6.5 * height / 8 },
    Q3: { x: width * 0.6, y: 6.5 * height / 8 },
    Q4: { x: width *.75, y: 6.5 * height / 8 }
  }

  var starTitle = {
    3: { x: width / 6, y: 1 * height / 3 },
    4: { x: 6.5 * width / 8, y: 1 * height / 3 }
  }

  // @v4 strength to apply to the position forces
  var forceStrength = 0.03;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  /*
   * Charge function that is called for each node.
   * As part of the ManyBody force.
   * This is what creates the repulsion between nodes.
   * 
   * Charge is proportional to the diameter of the
   * circle (which is stored in the radius attribute
   * of the circle's associated data.
   * 
   * This is done to allow for accurate collision
   * detection with nodes of different sizes.
   * 
   * Charge is negative because we want nodes to repel.
   * @v4 Before the charge was a stand-alone attribute
   *  of the force layout. Now we can use it as a separate force!
   */
  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  // Here we create a force layout and
  // @v4 We create a force simulation now and
  //  add forces to it.
  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  // @v4 Force starts up automatically,
  //  which we don't want as there aren't any nodes yet.
  simulation.stop();

  // Nice looking colors - no reason to buck the trend
  // @v4 scales now have a flattened naming scheme
  var fillColor = d3.scaleOrdinal(d3.schemeCategory20)
    .domain(['Eighteen_Plus', 'Everyone', 'Ten_Plus', 'Mature', 'Teen', 'Unrated']);

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  function createNodes(rawData) {
    // Use the max reviews in the data as the max in the scale's domain
    // note we have to ensure the reviews is a number.
    var maxAmount = d3.max(rawData, function (d) { return +d.Reviews; });

    // Sizes bubbles based on area.
    // @v4: new flattened scale names.
    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 40])
      .domain([0, maxAmount]);

    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.Reviews),
        Reviews: +d.Reviews,
        Year: d.Year,
        Rating: +d.Rating,
        Boardgame: d.Boardgame,
        Time: d.Time,
        Description: d.Description,
        Quartile: d.Quartile,
        Content_Rating: d.Content_Rating,
        Category: d.Category,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.Reviews - a.Reviews; });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    nodes = createNodes(rawData);

    // Create a SVG element inside the provided selector
    // with desired size.
    bubble_svg = d3.select(selector)
      .append('svg')
      .attr('id', 'bubble_svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = bubble_svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    // @v4 Selections are immutable, so lets capture the
    //  enter selection to apply our transtition to below.
    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.Content_Rating); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.Content_Rating)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!
    simulation.nodes(nodes);

    // Set initial layout to single group.
    groupBubbles();
  };

  /*
   * Callback function that is called after every tick of the
   * force simulation.
   * Here we do the acutal repositioning of the SVG circles
   * based on the current x and y values of their bound node data.
   * These x and y values are modified by the force simulation.
   */
  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  /*
   * Provides a x value for each node to be used with the split by year
   * x force.
   */
  function nodeStatePosX(d) {

    // console.log(d.Content_Rating + "is logged")
    try {
      return stateCenters[d.Content_Rating].x;
    } catch (err){
      console.log(stateCenters)
      console.log(d.Content_Rating + " is Content")
      console.log(d.App + "is logged")
    }
  }

  function nodeStatePosY(d) {
    return stateCenters[d.Content_Rating].y;
  }

  function nodeQuartilePosX(d) {
    return quartileCenters[Math.floor(d.Quartile)].x;
  }

  function nodeQuartilePosY(d) {
    return quartileCenters[Math.floor(d.Quartile)].y;
  }

  function nodeStarPosX(d) {
    return starCenters[Math.floor(d.Rating)].x;
  }

  function nodeStarPosY(d) {
    return starCenters[Math.floor(d.Rating)].y;
  }

  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  //TODO
  function groupBubbles() {
    hideTitles('.Content_Rating');
    hideTitles('.Rating');
    hideTitles('.Quartile');

    d3.selectAll("#bubble_state_annotation").remove();
    d3.selectAll("#bubble_star_annotation").remove();
    d3.selectAll('#bubble_quartile_annotation').remove();

    // @v4 Reset the 'x' and 'y' force to draw the bubbles to the center.
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
    simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * yearCenter of their data's year.
   */
  function splitStateBubbles() {
    hideTitles('.Rating');
    hideTitles('.Quartile');

    showTitles(stateTitle, 'Content_Rating');

    d3.selectAll("#bubble_state_annotation").remove();
    d3.selectAll("#bubble_star_annotation").remove();
    d3.selectAll("#bubble_quartile_annotation").remove();

    d3.select("#bubble_svg").append("g")
      .attr("class", "annotation-group")
      .attr("id", "bubble_state_annotation")
      .call(bubble_state_makeAnnotations);

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeStatePosX));
    simulation.force('y', d3.forceY().strength(forceStrength).y(nodeStatePosY));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  function splitStarBubbles() {
    hideTitles('.Content_Rating');
    hideTitles('.Quartile');

    showTitles(starTitle, 'Rating');

    d3.selectAll("#bubble_state_annotation").remove();
    d3.selectAll("#bubble_star_annotation").remove();
    d3.selectAll("#bubble_quartile_annotation").remove();

    d3.select("#bubble_svg").append("g")
      .attr("class", "annotation-group")
      .attr("id", "bubble_star_annotation")
      .call(bubble_star_makeAnnotations)

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeStarPosX));
    simulation.force('y', d3.forceY().strength(forceStrength).y(nodeStarPosY));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  function quartileBubbles() {
    hideTitles('.Content_Rating');
    hideTitles('.Rating');

    showTitles(quartileTitle, 'Quartile');

    d3.selectAll("#bubble_state_annotation").remove();
    d3.selectAll("#bubble_star_annotation").remove();
    d3.selectAll("#bubble_quartile_annotation").remove();

    d3.select("#bubble_svg").append("g")
      .attr("class", "annotation-group")
      .attr("id", "bubble_quartile_annotation")
      .call(bubble_quartile_makeAnnotations);

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeStarPosX));
    simulation.force('y', d3.forceY().strength(forceStrength).y(nodeStarPosY));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  /*
   * Hides Year title displays.
   */
  function hideTitles(title) {
    bubble_svg.selectAll(title).remove();
  }

  /*
   * Shows Year title displays.
   */
  function showTitles(title, titleClass) {
    var titleData = d3.keys(title);
    var titles = bubble_svg.selectAll('.'+titleClass)
      .data(titleData);

    titles.enter().append('text')
      .attr('class', titleClass)
      .attr('x', function (d) { return title[d].x; })
      .attr('y', function (d) { return title[d].y; })
      .attr('text-anchor', 'middle')
      .text(function (d) {
        if (d == 1) {
         // return '⭐';
        } else if (d == 2) {
        //  return '⭐⭐';
        } else if (d == 3) {
          return '⭐⭐⭐';
        } else if (d == 4) {
          return '⭐⭐⭐⭐';
        } else if (d == 5) {
         // return '⭐⭐⭐⭐⭐';
        } else {
          return d;
        }
      });
  }

  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    console.log(d);

    var content = '<span class="name">Boardgame: </span><span class="value">' +
        d.Boardgame +
        '</span><br/>' +
        '<span class="name">Rank (1-500): </span><span class="value">' +
                  d.id +
                  '</span><br/>' +
                  '<span class="name">Category: </span><span class="value">' +
                  d.Content_Rating +
                  '</span><br/>' +
                  '<span class="name">Number of Reviews: </span><span class="value">' +
                  addCommas(d.Reviews) +
                  '</span><br/>' +
                  '<span class="name">Rating: </span><span class="value">' +
                  d.Rating +
                  '</span><br/>' +
                  '<span class="name">Description: </span><span class="value">' +
                  d.Description +
                  '</span><br/>' + 
                  '<span class="name">Quartile: </span><span class="value">' +
                  d.Quartile + 
                  '</span><br/>' + 
                  '</span>';

    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.Content_Rating)).darker());

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'year' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'state') {
      splitStateBubbles();
    } else if (displayName === 'quartile') {
      quartileBubbles();
    } else if (displayName === 'stars') {
      splitStarBubbles();
    }else {
      groupBubbles();
    }
  };


  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

const myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}


