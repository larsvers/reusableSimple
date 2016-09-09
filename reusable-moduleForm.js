
var vis = vis || {};

// load/format
d3.csv('data/movie.csv', type, function(err, data) {

	var data = data;

	// Choose the main quant variable the chart displays (and update the button accordingly)
	var xVariable = 'budget';
	d3.select('button#sort1').html('sort by ' + xVariable);

	// Compose the chart
	var newChart = vis.build.chart()
		.xVar(xVariable);

	// Initialise the chart
	d3.select('div.container')
			.datum(data)
			.call(newChart);


	// Change the data option 1
	d3.select('#sort1').on('mousedown', function(d) {

		data = _.sortBy(data, function(el) { return el[xVariable]; });

		d3.select('div.container')
				.datum(data)
				.call(newChart);

	});

	// Change the data option 2
	d3.select('#sort2').on('mousedown', function(d) {

		data = _.sortBy(data, function(el) { return el.film; });

		d3.select('div.container')
				.datum(data)
				.call(newChart);

	});
	
});


vis.build = (function() {

	var myvis = {};

	myvis.chart = function() {

		// Exposed variables

		var width = 700;
		var height = 400;

		var xVar = 'rating';
		var yVar = 'film';

		// Closure to hide mechanics
		function my(selection) {

			// pass the data to each selection (multiples-friendly)
			selection.each(function(data, i) {

				var minX = 0;
				var maxX = d3.max(data, function(d) { return d[xVar]; });

				var scaleX = d3.scale.linear().domain([minX, maxX]).range([0, width]);
				var scaleY = d3.scale.ordinal().domain(d3.range(data.length)).rangePoints([height, 0], 1);
				

	      // In the following we'll attach an svg element to the container element (the 'selection') when and only when we run this the first time.
	      // We do this by using the mechanics of the data join and the enter selection. 
	      // As a short reminder: the data join (on its own, not chained with .enter()) checks how many data items there are 
	      // and stages a respective number of DOM elements.
	      // An join on its own - detached from the .enter() method checks first how many data elements come in new 
	      // (n = new data elements) to the data join selection and then it appends the specified DOM element exactly n times. 

	      // Here we do exactly that with joining the data as one array element with the non-existing svg first:

				var svg = d3.select(this) 	// conatiner (here 'body')
						.selectAll('svg')				// first time: empty selection of staged svg elements (it's .selectAll not .select)
						.data([data]);					// first time: one array item, hence one svg will be staged (but not yet entered); 

	      svg 												// one data item [data] staged with one svg element
		      	.enter()                // first time: initialise the DOM element entry; second time+: empty
		      	.append("svg");         // first time: append the svg; second time+: nothing happens

	      // If we have more elements apart from the svg element that should only be appended once to the chart 
	      // like axes, or svg > g-elements for the margins, 
	      // we would store the enter-selection in a unique variable (like 'svgEnter', or if we inlcude another g 'gEnter'. 
	      // This allows us to reference just the enter()-selection which would be empty with every update, 
	      // not invoking anything that comes after .enter() - apart from the very first time.

				svg
					.attr('width', width)
					.attr('height', height);				


				// Here comes the general update pattern:

				// Data join
				var bar = svg
						.selectAll('.bar')
						.data(data, function(d) { return d[yVar]; }); // key function to achieve object constancy

				// Enter
				bar
						.enter()
					.append('rect')
						.classed('bar', true)
						.attr('x', scaleX(minX))
						.attr('height', 5)
						.attr('width', function(d) { return scaleX(minX); });

				// Update
				bar
					.transition().duration(1000).delay(function(d,i) { return i / (data.length-1) * 1000; }) // implement gratuitous object constancy
						.attr('width', function(d) { return scaleX(d[xVar]); })
						.attr('y', function(d, i) { return scaleY(i); });

				// Exit
				bar
						.exit()
					.transition().duration(1000)
						.attr('width', function(d) { return scaleX(minX); })
						.remove();

			}); // selection.each()

			triggerTooltip(yVar); // invoke tooltip - not necessary, forget about it, remove it to keep it simple

		} // Closure

		
		// Accessor functions for exposed variables

		my.xVar = function(value) {
			if(!arguments.length) return xVar;
			xVar = String(value);
			return my;
		}

		my.yVar = function(value) {
			if(!arguments.length) return yVar;
			yVar = String(value);
			return my;
		}

		my.width = function(value) {
			if(!arguments.length) return width;
			width = value;
			return my;
		}

		my.height = function(value) {
			if(!arguments.length) return height;
			height = value;
			return my;
		}


		return my; // Expose chart closure

	} // chart()

	return myvis; // Expose vis closure

})(); // vis.build()




// Format data
function type(d) {
	d.film = d.film;
	d.rating = +d.rating;
	return d;
}


// Tooltip (not key, but kind)
var triggerTooltip = function(yVar) {

	d3.selectAll('.bar').on('mouseover', function(d) {

		var datapoint = d3.select(this).data()[0];

		d3.select('div.tooltip')
				.style('left', (d3.event.pageX + 5) + 'px')
				.style('top', (d3.event.pageY + 5) + 'px')
				.html(datapoint[yVar]) 
				.style('opacity', 0)
			.transition()
				.style('opacity', .9);

	});

	d3.selectAll('.bar').on('mousemove', function(d) {

		d3.select('div.tooltip')
				.style('left', (d3.event.pageX + 5) + 'px')
				.style('top', (d3.event.pageY + 5) + 'px');
	});

	d3.selectAll('.bar').on('mouseout', function(d) {

		d3.select('div.tooltip')
			.transition()
				.style('opacity', 0);

	});
		
};
