// Annotations for Bubble Chart
const bubble_state_annotations = [         
{
    type: d3.annotationLabel,
    note: {
    title: "Major Group of Content Rating",
    label: "Most of the analyzed Apps are applicable to everyone(all ages)",
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
    title: "Majority 3-4 Stars",
    label: "Most of the reviews have ratings at 3 or 4",
    wrap: 190
    },
    x: 500,
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
