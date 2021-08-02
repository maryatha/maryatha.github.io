// Annotations for Bubble Chart
const bubble_state_annotations = [         
{
    type: d3.annotationLabel,
    note: {
    title: "Strategy games are the most popular category of highest rank games",
    label: "Strategy games make up 59% of the top rated boardgames",
    wrap: 190
    },
    x: 500,
    y: 550,
    dy: -160,
    dx: -120
}]

const bubble_state_makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(bubble_state_annotations)

const bubble_star_annotations = [
{
    type: d3.annotationLabel,
    note: {
    title: "Most Top Rated Games are Rated 3 Stars",
    label: "Only 80 of the 500 games received 4 star reviews. 73% of the 4 star games are strategy games.",
    wrap: 190
    },
    x: 800,
    y: 200,
    dy: 0,
    dx: 0
}]

const bubble_star_makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(bubble_star_annotations)


const zoom_makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(zoom_annotations)

d3.select("#zoomable_svg")
    .append("g")
    .attr("class", "annotation-group")
    .attr("id", "zoom_annotation")
    .call(zoom_makeAnnotations)

// // Annotations for Line Chart
