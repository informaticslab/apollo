angular.module('apolloApp')
	.directive('ngLinkageViewer', [

		function() {
			return {
				link: function(scope, element, attrs) {


					scope.checkModel = {
						Organization:false,
						Program:false,
						SurveillanceSystem:false,
						Tool:false,
						Registry:false,
						HealthSurvey:false,
						Collaborative:false,
						Dataset:false,
						DataStandard:false,
						Tag:false
					};


					scope.showOrganization=false;
					scope.showProgram=false;
					scope.showSurveillanceSystem=false;
					scope.showTool=false;
					scope.showRegistry=false;
					scope.showHealthSurvey=false;
					scope.showCollaborative=false;
					scope.showDataset=false;
					scope.showDataStandard=false;
					scope.showTag=false;


					var url = $(location).attr('href');
					var split = url.split('/');
					var id = split[split.length - 1];

					//var nodename=

					var rootnodelabel="";


					d3.json("/apollo/api/node/viewer/" + id, function(error, json) {

						var togglehidelinks = true;
						var togglefixnodes = true;
						//var w = 1000,
						var w = $("div.block_linkage").width();
						var h = 900;
						var r = 10;
						var rcent = 15; //radius of node circle

						var svg = d3.select(".block_linkage").append("svg:svg")
							.attr("width", w)
							.attr("height", h);

						d3.select("svg")
							.append("input")
							.attr("type", "checkbox")
							.style("position", "absolute")
							.style("top", "320")
							.style("left", "150");

						d3.select(window).on('resize', svgresize);

						if (json == undefined | error) {

							var nodename = "";
							d3.text("/apollo/api/node/name/" + id, function(error, data) {

								nodename = data;

								if (nodename == "Not Found") {
									var msg = "No node found for ID " + id;
									var xcoord = (w / 2) - (msg.length * 9 / 2);

									var errormsg = svg.append("text")
										.text(msg)
										.attr("class", "linkageerrormsg")
										.attr("x", xcoord)
										.attr("y", h / 6);

								} else {
									var msg = nodename + " has no relationships with other entities.";
									var xcoord = (w / 2) - (msg.length * 9 / 2);

									var errormsg = svg.append("text")
										.text(msg)
										.attr("class", "linkageerrormsg")
										.attr("x", xcoord)
										.attr("y", h / 6);


								}


							});

						} else {





							//var h= $("div.block_linkage").outerHeight();

							var force = d3.layout.force()
								.nodes(json.nodes)
								.links(json.links)
								.size([w, h])
								.linkDistance(200)
								.charge(-1850)
								.on("tick", tick)
								.start();

							//console.log($("div.block_linkage").outerWidth(),$("div.block_linkage").outerHeight());





							d3.select(".btn.btn-default.pull-left.link_button1").on("click", clickreset);
							d3.select(".btn.btn-default.pull-left.link_button5").on("click", locknodes);
							d3.select(".btn.btn-default.pull-left.link_button4").on("click", hidelinks);

							d3.select(".btn.btn-default.link_button6").on("click", clusterlayout);


							var drag = force.drag()
								.on("dragstart", dragstart);


							var path = svg.append("svg:g")
								.selectAll("path")
								.data(json.links)
								.enter().append("svg:path")
								.attr("id", function(d) {
									return d.source.index + "_" + d.target.index;
								})
								.attr("pseudo_id", function(d) {
									return d.source.label + "_" + d.target.label;
								})
								//.attr("class", "link")
								.attr("class", function(d) {
									return "link " + d.source.label + " " + d.target.label;
								});



							var circle = svg.append("svg:g")
								.selectAll("circle")
								.data(json.nodes)
								.enter().append("svg:circle")
								.attr("r", function(d) {
									if (d.index == 0) return rcent;
									else return r;
								})
								.attr("class", function(d) {
									//console.log(d.label);
									if(d.id==id) rootnodelabel=d.label;
									var labelname="show"+d.label;
									scope[labelname]=true;
									return "node " + d.label;
								})
								.on("dblclick", dblclick)
								.call(force.drag);

							var text = svg.append("svg:g")
								.selectAll("g")
								.data(json.nodes)
								.enter().append("svg:g");

							// A copy of the text with a thick white stroke for legibility.
							/*text.append("svg:text")
							.attr("x", 8)
							.attr("y", ".31em")
							.attr("class", "shadow")
							.text(function(d) { return d.name; });*/

							text.append("a").attr("xlink:href", function(d) {
								return "/apollo/#/linkage/" + d.id;
							})
								.append("svg:text")
								.attr("class", function(d) {
									return "nodetext " + d.label;
								})
								.attr("x", 25)
								.attr("y", ".31em")
								.text(function(d) {
									return d.name + " (" + d.label + ")";
								})
								.style("font-weight", function(d) {
									if (d.index == 0) {
										return "bold";
									} else return "normal";
								});

							//For tooltip
							var div = d3.select("body").append("div")
								.attr("class", "tooltip")
								.style("opacity", 0);



							var path_label = svg.append("svg:g").selectAll(".path_label")
								.data(json.links)
								.enter()
								.append("svg:text")
								//.attr("class", "path_label")
								.attr("pseudo_id", function(d) {
									return d.source.label + "_" + d.target.label;
								})
								.attr("class", function(d) {
									return "path_label " + d.source.label + " " + d.target.label;
								});

							path_label.append("svg:textPath")
								.attr("startOffset", "50%")
								.attr("text-anchor", "middle")
								.attr("xlink:href", function(d) {
									return "#" + d.source.index + "_" + d.target.index;
								})
								.style("font-family", "Arial")
								.text(function(d) {
									return d.type;
								})
								.attr("pseudo_id", function(d) {
									return d.source.label + "_" + d.target.label;
								})
								.on("click", function(d) {
									div.transition()
										.duration(200)
										.style("opacity", .9);
									div.html(d.description)
										.style("left", (d3.event.pageX) + "px")
										.style("top", (d3.event.pageY - 28) + "px");
								})
								.on("mouseout", function(d) {
									div.transition()
										.duration(500)
										.style("opacity", 0);
								});
						} //else if undefined or error


						function tick() {

							w = $("svg").outerWidth();
							h = $("svg").outerHeight();



							//console.log($("svg").outerWidth());


							circle.attr("cx", function(d) {
								return d.x = Math.max(rcent + 2, Math.min(w - rcent - 2, d.x));
							})
								.attr("cy", function(d) {
									return d.y = Math.max(rcent + 2, Math.min(h - rcent - 2, d.y));
								});

							path.attr("d", function(d) {
								var dx = d.target.x - d.source.x,
									dy = d.target.y - d.source.y,
									dr = Math.sqrt(dx * dx + dy * dy),
									theta = Math.atan2(dy, dx) + Math.PI / 100, //orientation of the arrow
									d90 = Math.PI / 2,
									dtxs = d.target.x - 10 * Math.cos(theta), //distance of arrow from the node
									dtys = d.target.y - 10 * Math.sin(theta);
								//return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y + "M" + dtxs + "," + dtys +  "l" + (3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (-3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "L" + (dtxs - 3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (dtys + 3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "z";
								return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y + "M" + dtxs + "," + dtys + "l" + (3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (-3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "L" + (dtxs - 3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (dtys + 3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "z";
								//return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y +"m0,-5l10,0l0,5z";
								//return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y + "M" + dtxs + "," + dtys +  "l" + (3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (-3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "L" + (dtxs - 3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (dtys + 3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "z";
							})
								.style("fill", "#8D8D91");


							path_label.attr('transform', function(d) {
								//return 'translate(' + d.source.x + ',' + d.source.y + );
								if (d.target.x < d.source.x) {

									midx = (d.source.x + d.target.x) / 2;
									midy = (d.source.y + d.target.y) / 2;
									return 'rotate(180 ' + midx + ' ' + midy + ') ';
								} else {
									return 'rotate(0)';
								}
							});

							text.attr("transform", function(d) {
								return "translate(" + d.x + "," + d.y + ")";
							});
							force.size([w, h]);
						}

						function dblclick(d) {
							d.fixed = false;
							d3.select(this).classed("fixed", false);
						}


						function locknodes(lock) {

							if (lock == "lock") {
								d3.selectAll("circle").classed("fixed", true);
								d3.select(".btn.btn-default.pull-left.link_button5").classed("active", true);
								i = 0;
								for (n in json.nodes) {
									//alert(n.id);
									json.nodes[i].fixed = true;
									i++;

								}

								togglefixnodes = false;

							} else {

								if (togglefixnodes) {

									d3.selectAll("circle").classed("fixed", true);
									d3.select(".btn.btn-default.pull-left.link_button5").classed("active", true);
									i = 0;
									for (n in json.nodes) {
										//alert(n.id);
										json.nodes[i].fixed = true;
										i++;

									}

									togglefixnodes = false;
								} else {

									d3.selectAll("circle").classed("fixed", false);
									d3.select(".btn.btn-default.pull-left.link_button5").classed("active", false);
									i = 0;
									for (n in json.nodes) {
										//alert(n.id);
										json.nodes[i].fixed = false;
										i++;

									}
									//force.start();
									togglefixnodes = true;

								}
							}

						}



						function clickreset(d) {

							d3.selectAll("circle").classed("fixed", false);
							togglefixnodes = true;
							d3.select(".btn.btn-default.pull-left.link_button5").classed("active", false);

							i = 0;
							for (n in json.nodes) {
								//alert(n.id);
								json.nodes[i].fixed = false;
								i++;

							}

							d3.selectAll("circle").attr("visibility", "visible");
							d3.selectAll("path").attr("visibility", "visible");
							d3.selectAll("text").attr("visibility", "visible");
							d3.select(".btn.btn-default.pull-left.link_button4").classed("active", false);
							togglehidelinks = true;

							force.start();

						}

						function hidelinks(x) {

							if (x == "hide") {
								d3.selectAll("path").attr("visibility", "hidden");
								d3.selectAll("text.path_label").attr("visibility", "hidden");
								d3.select(".btn.btn-default.pull-left.link_button4").classed("active", true);

								togglehidelinks = false;

							} else {
								if (togglehidelinks) {
									d3.selectAll("path").attr("visibility", "hidden");
									d3.selectAll("text.path_label").attr("visibility", "hidden");
									d3.select(".btn.btn-default.pull-left.link_button4").classed("active", true);

									togglehidelinks = false;
								} else {
									d3.selectAll("path").attr("visibility", "visible");
									d3.selectAll("text.path_label").attr("visibility", "visible");
									d3.select(".btn.btn-default.pull-left.link_button4").classed("active", false);
									togglehidelinks = true;
								}

							}



						}

						function svgresize() {
							//alert("aa");

							w = $("div.block_linkage").width();
							//h= $("div.block_linkage").outerHeight();

							d3.select("svg").attr("width", w).attr("height", h);
							force.size([w, h]);
							force.start();

						}

						scope.hidenodes= function(nodetype,flg) {

							
							var showflg;
							if(flg==true)
							{
								showflg='visible';
							}
							else
							{
								showflg='hidden';
							}

							d3.selectAll("circle.node." + nodetype)
							.attr("visibility",function(d){
								
								if(d.id!=id)
								{
									return showflg;	
								}
								

							});

							d3.selectAll("text.nodetext." + nodetype)
							.attr("visibility",function(d){
								
								if(d.id!=id)
								{
									return showflg;	
								}
								

							});


							d3.selectAll("path.link[pseudo_id=\""+rootnodelabel+"_"+nodetype+"\"]")
							.attr("visibility",showflg);

							d3.selectAll("path.link[pseudo_id=\""+nodetype+"_"+rootnodelabel+"\"]")
							.attr("visibility",showflg);
							

							d3.selectAll("text[pseudo_id='"+nodetype+"_"+rootnodelabel+"']")
							.attr("visibility",showflg);

							d3.selectAll("text[pseudo_id='"+rootnodelabel+"_"+nodetype+"']")
							.attr("visibility",showflg);

							
							//attr("visibility", "hidden");

						}



						function clusterlayout() {

							//console.log("cluster layout");
							force.stop();

							circle.sort(function(a, b) {
								return d3.ascending(a.label, b.label);
							});
							text.sort(function(a, b) {
								return d3.ascending(a.label, b.label);
							});

							sw = $("svg").outerWidth();
							sh = $("svg").outerHeight();


							var n = circle[0].length; // number of child nodes

							var step = 2 * Math.PI / n;
							var h = sw / 2;
							var k = sh / 2;


							var r = 220;

							if (n > 40) {
								r = 300;
							}

							if (n > 80) {
								r = 350;
							}
							var pos = [];


							for (var theta = 0; theta < 2 * Math.PI; theta += step) {
								var x = h + r * Math.cos(theta);
								var y = k - r * Math.sin(theta); //note 2.
								pos.push([x, y]);
							}

							//console.log(pos);


							circle.transition()
								.duration(1000)
								.delay(function(d, i) {
									return i * 5;
								})
								.attr("cx", function(d, i) {
									d.px = pos[i][0];;
									return d.x = pos[i][0];
								})
								.attr("cy", function(d, i) {
									d.py = pos[i][1];
									return d.y = pos[i][1];
								});


							text.transition()
								.duration(1000)
								.delay(function(d, i) {
									return i * 5;
								})
								.attr("transform", function(d, i) {
									return "translate(" + pos[i][0] + "," + pos[i][1] + ")";
								});

							path.transition()
								.duration(1000)
								.delay(function(d, i) {
									return i * 5;
								})
								.attr("d", function(d) {

									circle.each(function(d1, i1) {

										if (d.target.id == d1.id & d.target.index == d1.index) {

											d.target.x = d1.x;
											d.target.y = d1.y;

										} else if (d.source.id == d1.id & d.source.index == d1.index) {
											d.source.x = d1.x;
											d.source.y = d1.y;
										} else {

										}
									});


									var dx = d.target.x - d.source.x,
										dy = d.target.y - d.source.y,
										dr = Math.sqrt(dx * dx + dy * dy),
										theta = Math.atan2(dy, dx) + Math.PI / 100, //orientation of the arrow
										d90 = Math.PI / 2,
										dtxs = d.target.x - 10 * Math.cos(theta), //distance of arrow from the node
										dtys = d.target.y - 10 * Math.sin(theta);
									return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y + "M" + dtxs + "," + dtys + "l" + (3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (-3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "L" + (dtxs - 3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (dtys + 3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "z";
								});

							//Set values to 0,0 since these are relative postions. Any value greater than 0,0 will offset the path label by a and y values.
							path_label
								.attr('transform', function(d) {
									return 'translate(' + 0 + ',' + 0 + ')';
								});

							//.style("fill", "#8D8D91");



							hidelinks("hide");
							locknodes("lock");



						}


						function linkmouseover(d) {

							alert(d3.select(this).attr("testattr"));

						}

						function dragstart(d) {
							d3.select(this).classed("fixed", true);
							//d3.select(this).attr("class","node fixed");
							d.fixed = true;
						}

					});


				},
				template: 	'<div class="btn-group">' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'Organization\',checkModel.Organization)" ng-model="checkModel.Organization" btn-checkbox ng-show="showOrganization">Organization</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'Program\',checkModel.Program)" ng-model="checkModel.Program" btn-checkbox ng-show="showProgram">Program</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'SurveillanceSystem\',checkModel.SurveillanceSystem)" ng-model="checkModel.SurveillanceSystem" btn-checkbox ng-show="showSurveillanceSystem">SurveillanceSystem</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'Tool\',checkModel.Tool)" ng-model="checkModel.Tool" btn-checkbox ng-show="showTool">Tool</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'Registry\',checkModel.Registry)" ng-model="checkModel.Registry" btn-checkbox ng-show="showRegistry">Registry</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'HealthSurvey\',checkModel.HealthSurvey)" ng-model="checkModel.HealthSurvey" btn-checkbox ng-show="showHealthSurvey">HealthSurvey</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'Collaborative\',checkModel.Collaborative)" ng-model="checkModel.Collaborative" btn-checkbox ng-show="showCollaborative">Collaborative</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'Dataset\',checkModel.Dataset)" ng-model="checkModel.Dataset" btn-checkbox ng-show="showDataset">Dataset</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'DataStandard\',checkModel.DataStandard)" ng-model="checkModel.DataStandard" btn-checkbox ng-show="showDataStandard">DataStandard</label>' +
							'<label class="btn btn-primary" id="chk1" ng-click="hidenodes(\'Tag\',checkModel.Tag)" ng-model="checkModel.Tag" btn-checkbox ng-show="showTag">Tag</label>' +
							'</div>'
			}
		}
	]);