/*
* mindmap
* https://github.com/Chaptykov/mindmap
*
* Copyright (c) 2013 Chaptykov
* Licensed under the MIT license.
*/

(function($) {

    var params;
	var saveArray = new Array(false, false);
	var tempText = "";
	var initialized = false;
	var containerId;
	
    var methods = {
		
        init: function( options ) {
            var self = $(this);
			initialized = true;
			/*containerId = self.prop("id");
			if (containerId == "dialogPathContainer") {
				containerId = "dialogPath";
				self = $("#" + containerId);
			}
			console.log(containerId + ' init');*/
            params = $.extend({

                // Classes
                nodeClass: 'node',
                nodeInputClass: 'node__input',
                nodeTextClass: 'node__text',
                activeClass: 'node_active',
                editableClass: 'node_editable',
                rootClass: 'node_root',
                childrenClass: 'children',
                childrenItemClass: 'children__item',
                leftBranch: 'children_leftbranch',
                rightBranch: 'children_rightbranch',

                // Settings
                root: self,
                balance: true

            }, options);

            params.nodes = self.find('.' + params.nodeClass);
            params.nodeInput = self.find('.' + params.nodeInputClass);
			
            if (self.find(params.activeClass).length) {
                params.activeNode = self.find(params.activeClass);
            }
            else {
                params.activeNode = null;
            }

            // Keyboard events
			$(document).on('keyup', '.' + params.nodeClass, function(event) {
			//$(document).on('keydown', function(event) {
				
				var key = event.which || event.keyCode;
				
				switch(key) {
					// ctrl
					case 17:
						saveArray[0] = false;
						break;
					// s
					case 83:
						saveArray[1] = false;
						break;
				}
			});
			
            //$(document).on('keydown', '.' + params.nodeClass, function(event) {
			$(document).on('keydown', function(event) {
                if (!params.activeNode) {
                    return;
                }

                var key = event.which || event.keyCode,
                    node = params.activeNode,
                    prevNode,
                    nextNode;

                // console.log(key);

                switch(key) {
					
					// Ctrl+s
					// ctrl
					case 17:
						saveArray[0] = true;
						break;
					// s
					case 83:
						saveArray[1] = true;
						
						if(saveArray[0] == true && saveArray[1] == true){
							saveArray[0] = false;
							saveArray[1] = false;
							
							event.preventDefault();
							event.stopPropagation();
							var nodeInput = node.find('.' + params.nodeInputClass);
							var nodeText = node.find('.' + params.nodeTextClass);
							if (node.hasClass(params.editableClass)) {
								methods.blur();
								methods.setActive(node);
								dialogNodeChanged($(node).parent().prop("id"), nodeInput.val());
								tempText = "";
							}
							
							return false;
						}
						break;
                    // Enter
                    case 13:
					
                        if (!node.hasClass(params.editableClass)) {
                            if (node.hasClass(params.rootClass)) {
                                return;
                            }
                            //methods.addNode();
							if (!node.hasClass(params.editableClass)) {
								methods.blur();
								methods.setEditable(node);
								node.mouseleave();
								tempText = node.find('.' + params.nodeInputClass).val();
								return false;
							}
                        }
                        break;

                    // Tab
                    case 9:
						if (!node.hasClass(params.editableClass)) {
                            if (node.hasClass(params.rootClass)) {
                                return;
                            }
							if (checkIfDialogPathAddNode(node.parent().prop("id"))) {
								addDialogPathNode(node.parent().prop("id"));
								return false;
							}
						}
                        /*if (!node.hasClass(params.editableClass)) {
                            event.preventDefault();
                            methods.addChildNode();
                        }
                        else {
                            methods.blur();
                            methods.setActive(node);
                        }*/
                        break;

                    // Esc
                    case 27:
						//$('.' + params.nodeTextClass).show();
                        var nodeText = node.find('.' + params.nodeTextClass);
                        var nodeInput = node.find('.' + params.nodeInputClass);
						if (node.hasClass(params.editableClass)) {
							nodeText.text(tempText);
							nodeInput.val(tempText);
							var inputSize = nodeInput.val().length - 3;
							if (inputSize < 5) {
								inputSize = 5;
							}
							nodeInput.prop("size", inputSize);
							methods.blur();
							tempText = "";
							methods.setActive(node);
						}
						else if (node.hasClass(params.activeClass)) {
							methods.blur();
							return false;
						}
						return true;
                        //

                    // Delete
                    case 46:
						if (!node.hasClass(params.editableClass)) {
                            if (node.hasClass(params.rootClass)) {
                                return;
                            }
							deleteDialogPathNode(node.parent().prop("id"));
							return false;
						}
						break;
					// backspace
                    case 8:
                        /*if (node.hasClass(params.editableClass)) {
                            return true;
                        }
                        else {
                            if (node.hasClass(params.rootClass)) {
                                return false;
                            }
                            nextNode = node.parent().next().children('.' + params.nodeClass);
                            parentNode = node.parent().parent().prev();

                            event.preventDefault();
                            methods.removeNode();

                            if (nextNode.length) {
                                nextNode.addClass(params.activeClass);
                                params.activeNode = nextNode;
                            } else {
                                parentNode.addClass(params.activeClass);
                                params.activeNode = parentNode;
                            }
                        }*/
                        break;

                    // Left
                    case 37:
                        if (node.hasClass(params.editableClass)) {
                            return true;
                        }
                        else {
                            if (node.hasClass(params.rootClass)) {
                                methods.selectChildNode($('.' + params.leftBranch));
                            } else {
                                if (node.closest('.' + params.rightBranch).length) {
									methods.selectParentNode();
                                }
                                else {
                                    methods.selectChildNode();
                                }
                            }
							event.preventDefault();
							event.stopPropagation();
							return false;
                        }
                        break;

                    // Up
                    case 38:
                        if (node.hasClass(params.editableClass)) {
                            return true;
                        }
                        else {
                            prevNode = node.parent().prev().children('.' + params.nodeClass);
                            if (prevNode.length) {
                                methods.blur();
                                methods.setActive(prevNode);
                            }
							event.preventDefault();
							event.stopPropagation();
							return false;
                        }
                        break;

                    // Right
                    case 39:
                        if (node.hasClass(params.editableClass)) {
                            return true;
                        }
                        else {
                            if (node.hasClass(params.rootClass)) {
								var beginning = "#dialogPath";
								if (node.hasClass("multiLinkRoot")) {
									beginning = "#" + node.parent().prop("id") + " ";
								}
                                methods.selectChildNode($(beginning + '.' + params.rightBranch));
                            } else {
                                if (node.closest('.' + params.rightBranch).length) {
                                    methods.selectChildNode();
                                }
                                else {
                                    methods.selectParentNode();
                                }
                            }
							event.preventDefault();
							event.stopPropagation();
							return false;
                        }
                        break;

                    // Down
                    case 40:
                        if (node.hasClass(params.editableClass)) {
                            return true;
                        }
                        else {
                            nextNode = node.parent().next().children('.' + params.nodeClass);
                            if (nextNode.length) {
                                methods.blur();
                                methods.setActive(nextNode);
                            }
							event.preventDefault();
							event.stopPropagation();
							return false;
                        }
                        break;

                }
            });

            // Click by node
            self
				.on('click', '.' + params.nodeClass + ':not(.' + params.editableClass + ', .notEditable)', function(e) {
                //.on('click', '.' + params.nodeClass + ':not(.' + params.nodeClass + ' > .dialogDeleteNode, .dialogAddNode, .viewDialog, .' + params.editableClass + ')', function() {
					
					e.preventDefault();
					e.stopPropagation();
					//return;
					//console.log("self clicked");
					//console.log(self.prop("id"));
					var node = params.activeNode;
					//self = $(this);
					var thisNode = $(this);
					//console.log(thisNode.prop("id"));
					
					if (node != null && node != thisNode && node.hasClass(params.editableClass)) {
						//methods.blur();
						//methods.setActive(node);
						var nodeInput = node.find('.' + params.nodeInputClass);
						dialogNodeChanged($(node).parent().prop("id"), nodeInput.val());
						tempText = "";
					}
					
                    if (!thisNode.hasClass(params.activeClass)) {
                        methods.blur();
                        methods.setActive(thisNode);
						return false;
                    }
					else {
                        methods.blur();
                        methods.setActive(thisNode);
                        methods.setEditable(thisNode);
						thisNode.mouseleave();
						tempText = thisNode.find('.' + params.nodeInputClass).val();
                    }
					return false;
                })
                // Input text
                .on('input paste', '.' + params.nodeInputClass, function(e) {
					
					e.preventDefault();
					e.stopPropagation();
					
                    var node = params.activeNode,
                        nodeText = node.find('.' + params.nodeTextClass),
                        nodeInput = $(this);

                    nodeText.text( nodeInput.val() );
					inputSize = nodeInput.val().length - 3;
					if (inputSize < 5) {
						inputSize = 5;
					}
					nodeInput.prop("size", inputSize);
					//dialogNodeChanged($(node).parent().prop("id"), nodeInput.val());
					return false;
                })
                .on('keydown', '.' + params.nodeInputClass, function(event) {
                    var key = event.which || event.keyCode;

                    if (key === 9) {
                        event.preventDefault();
                    }
                });
			
			/*self.on("click", ":not(.dialogPathNode, #dialogChainRootNode)", function(e) {
				e.preventDefault();
				 //var self = $(this);
				console.log(self.prop("id"));
				if (self.find(params.activeClass).length) {
					methods.blur();
					params.activeNode = self.find(params.activeClass);
					console.log("container clicked");
				}
				else {
					params.activeNode = null;
				}
				
				return false;
			});*/
        },

        destroy : function( ) {

            $(window).unbind('.mindmap');
			if (initialized) {
				//console.log(containerId + ' destroy');
				//$('#' + containerId).off('click', '.' + params.nodeClass + ':not(.' + params.editableClass + ', .notEditable)');
				//$('#' + containerId).off('input paste', '.' + params.nodeInputClass);
				//$(document).off('click', '.' + params.nodeClass + ':not(.viewDialog, .dialogDeleteNode, .dialogAddNode, .' + params.editableClass + ')');
				//self.off('click', '.' + params.nodeClass + ':not(.' + params.editableClass + ')');
				//self.off('input paste', '.' + params.nodeInputClass);
				$(document).off('keydown', '.' + params.nodeInputClass);
				$(document).off('keydown');
				$(document).off('keyup');
			}
        },

        selectParentNode: function() {
            var node = params.activeNode,
                parentBranch = node.parent().parent().parent(),
                parentNode;
			
			if (parentBranch.prop("id") != "dialogPathContainer" || (parentBranch.prop("id") == "dialogPathContainer" && $("#dialogChainRootNode").css("display") != "none"))  {
				parentNode = parentBranch.children('.' + params.nodeClass + ':first');
				methods.blur();
				methods.setActive(parentNode);
			}
			
			//return false;
        },

        selectChildNode: function(branch) {
            var node = params.activeNode,
                childNode;

            if (!branch) {
                branch = node.parent().children('.' + params.childrenClass);
            }

            childNode = branch.children('.' + params.childrenItemClass + ':first-child').children('.' + params.nodeClass);

            if (childNode.length) {
                methods.blur();
                methods.setActive(childNode);
            }
        },

        removeNode: function() {
            var node = params.activeNode,
                nodeBranch = node.parent(),
                parentBranch = nodeBranch.parent(),
                len = parentBranch.children().length - 1;

            if (!len) {
                parentBranch.remove();
            }
            else {
                nodeBranch.remove();
            }

            methods.blur();
            methods.balance();
        },

        addNode: function() {
            var nodeBranch = params.activeNode.parent().parent(),
                newNodeItem,
                newNode;

            nodeBranch.append( methods.getTemplate(1) );
            newNodeItem = nodeBranch.children('.' + params.childrenItemClass + ':last');
            newNode = newNodeItem.children('.' + params.nodeClass);

            methods.blur();
            methods.setEditable(newNode);
            methods.balance();
        },

        addChildNode: function() {
            var nodeBranch = params.activeNode.parent(),
                nodeChildren = nodeBranch.children('.' + params.childrenClass),
                nodeChildrenItem,
                newNode;

            if (nodeChildren.length) {
                if (params.activeNode.hasClass(params.rootClass) && nodeChildren.length === 2) {
                    nodeChildren = nodeChildren.filter('.' + params.leftBranch);
                }

                nodeChildren.append( methods.getTemplate(1) );
                nodeChildrenItem = nodeChildren.children('.' + params.childrenItemClass + ':last');
                newNode = nodeChildrenItem.children('.' + params.nodeClass);
            }
            else {
                nodeBranch.append( methods.getTemplate(1, 1) );
                nodeChildren = nodeBranch.children('.' + params.childrenClass);
                nodeChildrenItem = nodeChildren.children('.' + params.childrenItemClass + ':last');
                newNode = nodeChildrenItem.children('.' + params.nodeClass);
            }

            methods.blur();
            methods.setEditable(newNode);
            methods.balance();
        },

        blur: function() {
            if (!params.activeNode) {
                return;
            }

            var node = params.activeNode,
                nodeText = node.find('.' + params.nodeTextClass),
                nodeInput = node.find('.' + params.nodeInputClass);

            if (node.hasClass(params.editableClass)) {
                nodeText.text(nodeInput.val());
                nodeInput.blur();
            }

            node
                .removeClass(params.activeClass)
                .removeClass(params.editableClass);

            params.activeNode = null;
        },

        setActive: function(node) {
			
            node.addClass(params.activeClass);
            params.activeNode = node;
			
			var activeDialogNode = undefined;
			var id = node.parent().prop("id");
			if (id.indexOf("dialogPathNode_") != -1) {
				activeDialogNode = parseInt(id.replace("dialogPathNode_", ""));
			}
			else if (id.indexOf("dialogPathChoice_") != -1) {
				var temp = id.replace("dialogPathChoice_", "").split("_");
				activeDialogNode = parseInt(temp[0]);
			}
			else if (id.indexOf("dialogPathConditionalNext_") != -1) {
				var temp = id.replace("dialogPathConditionalNext_", "").split("_");
				activeDialogNode = parseInt(temp[0]);
			}
			if (activeDialogNode != undefined && $("#dialogsView .dialogSelection").prop("value") != activeDialogNode) {
				dialogRefreshPath = false;
				$("#dialogsView .dialogSelection").prop("value", activeDialogNode);
				$("#dialogsView .dialogSelection").change();
			} 
				
			
			//$('.' + params.nodeTextClass).show();
			//$("#dialogsView .dialogSelection").prop("value", parseInt(node.parent().prop("id").replace("dialogPathNode_", "")));
			//$("#dialogsView .dialogSelection").change();
        },

        setEditable: function(node) {
            var nodeInput = node.find('.' + params.nodeInputClass),
                nodeText = node.find('.' + params.nodeTextClass);

            node
                .addClass(params.activeClass)
                .addClass(params.editableClass)
                .attr('data-value', nodeText.text());

            nodeInput
                .val(nodeText.text())
                .focus()
                .select();
			inputSize = nodeInput.val().length - 3;
			if (inputSize < 5) {
				inputSize = 5;
			}
			nodeInput.prop("size", inputSize);
            params.activeNode = node;
			//nodeText.hide();
        },

        balance: function() {
            if (params.balance) {
                var height = 0,
                    delta,
                    newDelta,
                    rBranch = $('.' + params.rightBranch),
                    lBranch = $('.' + params.leftBranch),
                    rBranchChildren,
                    lBranchChildren,
                    sumHeight = 0,
                    rootBranches = params.root.children('.' + params.childrenClass),
                    freeBranch;

                // Чиним правую ветку, если ее не существует
                if (!rBranch.length) {
                    freeBranch = rootBranches.not('.' + params.leftBranch);

                    if (freeBranch.length) {
                        freeBranch.addClass(params.rightBranch);
                    }
                    else {
                        if (rootBranches.length) {
                            rootBranches
                                .eq(0)
                                .removeClass(params.leftBranch)
                                .addClass(params.rightBranch)
                                .appendTo(params.root);
                        }
                        else {
                            return; // Нет ни одной ветки
                        }
                    }
                }

                // Чиним левую ветку, если ее не существует
                if (!lBranch.length) {
                    freeBranch = rootBranches.not('.' + params.rightBranch);

                    if (freeBranch.length) {
                        freeBranch.addClass(params.leftBranch);
                    }
                    else {
                        if (rootBranches.length) {
                            params.root.prepend( methods.getTemplate(0, 1) );
                            params.root
                                .children('.' + params.childrenClass)
                                .not('.' + params.rightBranch)
                                .addClass(params.leftBranch);
                        }
                        else {
                            return; // Нет ни одной ветки
                        }
                    }
                }

                lBranchChildren = lBranch.children();
                rBranchChildren = rBranch.children();

                sumHeight = rBranch.outerHeight() + lBranch.outerHeight();
                delta = 0.5 * sumHeight;

                for (var i = 0, rlen = rBranchChildren.length; i < rlen; i++) {
                    height += rBranchChildren.eq(i).outerHeight();
                    newDelta = Math.abs(0.5 * sumHeight - height);

                    if (delta >= newDelta) {
                        delta = newDelta;
                    }
                    else {
                        methods.moveNodes(1, i, rlen);

                        return;
                    }
                }

                for (var j = 0, llen = lBranchChildren.length; j < llen; j++) {
                    height += lBranchChildren.eq(j).outerHeight();
                    newDelta = Math.abs(0.5 * sumHeight - height);

                    if (delta >= newDelta) {
                        delta = newDelta;
                    }
                    else {
                        if (j > 0) {
                            methods.moveNodes(0, 0, j - 1);
                        }

                        return;
                    }
                }

                methods.clearEmptyBranches();
            }
        },

        moveNodes: function(rtl, from, to) {
            var collection,
                branchSource,
                branchTarget;

            branchSource = rtl ? $('.' + params.rightBranch) : $('.' + params.leftBranch);
            branchTarget = rtl ? $('.' + params.leftBranch) : $('.' + params.rightBranch);

            collection = branchSource.children();

            collection.each(function(i){
                if (i >= from && i <= to) {
                    $(this).appendTo(branchTarget);
                }
            });

            methods.clearEmptyBranches();
        },

        clearEmptyBranches: function() {
            var rootBranches = params.root.children('.' + params.childrenClass);

            rootBranches.each(function() {
                if ( !$(this).children().length ) {
                    $(this).remove();
                }
            });
        },

        getTemplate: function(withNode, withWrap) {
            var template = '';

            template += withWrap ? ' <ol class="' + params.childrenClass + '">' : '';
            template += withNode ? '<li class="' + params.childrenItemClass + '"><div class="' + params.nodeClass + '"><div class="' + params.nodeTextClass + '">Node</div><input class="' + params.nodeInputClass + '" type="text"></div></li> ' : '';
            template += withWrap ? '</ol>' : '';

            return template;
        }
    };

    $.fn.mindmap = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Unknown method: ' +  method );
        }

    };

}(jQuery));
