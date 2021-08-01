d3.csv("data/data.csv",chart)


var tooltip_line = d3.select("body").append("div")
    .attr("class", "tooltip_line")
    .style("opacity", 0);

function chart(selector, csv) {

    var keys = ['1~3 Star','3~4 Star', '4~5 Star'];

    var year   = [...new Set(csv.map(d => d.Category))]
    var states = [...new Set(csv.map(d => d.Content))]

    var options = d3.select("#year").selectAll("option")
        .data(year)
        .enter().append("option")
        .text(d => d)

    var svg = d3.select("#chart"),
        margin = {top: 35, left: 35, bottom: 0, right: 0},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .padding(0.1)

    var y = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top])

    var xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "x-axis");

    var yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value ($)");

    var z = d3.scaleOrdinal()
        .range(["#2ca02c", "#ff7f0e", "#aec7e8"])
        .domain(keys);

    update(d3.select("#year").property("value"), 0)

    function update(input, speed) {

        var data = csv.filter(f => f.Category == input)

        data.forEach(function(d) {
            d.total = d3.sum(keys, k => +d[k])
            return d
        })

        y.domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice();

        svg.selectAll(".y-axis").transition().duration(speed)
            .call(d3.axisLeft(y).ticks(null, "s"))


        data.sort(d3.select("#sort").property("checked")
            ? (a, b) => b.total - a.total
            : (a, b) => states.indexOf(a.Content) - states.indexOf(b.Content))

        x.domain(data.map(d => d.Content));

        svg.selectAll(".x-axis").transition().duration(speed)
            .call(d3.axisBottom(x).tickSizeOuter(0))

        var group = svg.selectAll("g.layer")
            .data(d3.stack().keys(keys)(data), d => d.key)

        group.exit().remove()

        group.enter().append("g")
            .classed("layer", true)
            .attr("fill", d => z(d.key))
            .on("mouseover", function(d) {
                d3.select(this).style("fill", "red")
                console.log(d)
                tooltip_line.text("Total Installation Number is : " + d[3][1] )
                    .style("opacity", 0.8)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function(d) {
                tooltip_line.style("opacity", 0);
                d3.select(this).style("fill", d => z(d.key));
            });

        var bars = svg.selectAll("g.layer").selectAll("rect")
            .data(d => d, e => e.data.Content);

        bars.exit().remove()

        bars.enter().append("rect")
            .attr("width", x.bandwidth())
            .merge(bars)
            .transition().duration(speed)
            .attr("x", d => x(d.data.Content))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))

        var text = svg.selectAll(".text")
            .data(data, d => d.Content);

        text.exit().remove()

        text.enter().append("text")
            .attr("class", "text")
            .attr("text-anchor", "middle")
            .merge(text)
            .transition().duration(750)
            .attr("x", d => x(d.Content) + x.bandwidth() / 2)
            .attr("y", d => y(d.total) - 5)
            .text(d => d.total)

    }

    var select = d3.select("#year")
        .on("change", function() {
            update(this.value, 750)
        })

    var checkbox = d3.select("#sort")
        .on("click", function() {
            update(select.property("value"), 750)
        })

    var legend = svg.selectAll(".legend")
        .data(['1~3 Stars Rating', '3~4 Stars Rating', '4~5 Stars Rating'])
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(0," + i * 15 + ")"; })
        .style("opacity","0");

    legend.append("rect")
        .attr("x", 200)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", function(d) { return z(d); });

    legend.append("text")
        .attr("x", 340)
        .attr("y", 5)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {return d; });

    legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");



}