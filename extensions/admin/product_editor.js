/* **************************************************************

   Copyright 2011 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */

/*
An extension for acquiring and displaying 'lists' of categories.
The functions here are designed to work with 'reasonable' size lists of categories.
*/



var admin_prodEdit = function() {
	var theseTemplates = new Array(
		'productEditorTemplate',
		'ProductCreateNewTemplate',
		'productListTemplateTableResults',
		'productListTableListTemplate',
		'productListTemplateEditMe',
		'productEditorPanelTemplate',
		'mpControlSpec'
		);

	var r = {

		vars : {
			panels : {
				'general' : {'title':'General Product Information','isLegacy':false},
				'images' : {'title':'Images','isLegacy':false},
				'flexedit' : {'title':'Custom Fields/Flexedit','isLegacy':false},
				'wms' : {'title':'Warehouse Management','isLegacy':true},
				'inventory' : {'title':'Inventory 1.0','isLegacy':true},
				'sku' : {'title':'SKU Management','isLegacy':false},
				'shipping' : {'title':'Shipping','isLegacy':false},
				'navigation' : {'title':'Website Navigation','isLegacy':false},
				'syndication' : {'title':'Marketplaces (formerly syndication)','isLegacy':false},
				'ciengine' : {'title':'Competitive Intelligence','isLegacy':true},
				'amazon' : {'title':'Amazon Marketplace','isLegacy':true},
				'ebaypower' : {'title':'eBay Powerlister','isLegacy':true},
				'ebay2' : {'title':'eBay','isLegacy':true},
				'listing' : {'title':'HTML Listing','isLegacy':true},
				'doba' : {'title':'Doba Supplier Settings','isLegacy':true},
				'events' : {'title':'Listing Events','isLegacy':true},
				'xsell' : {'title':'Cross Selling','isLegacy':true},
				'wholesale' : {'title':'Wholesale','isLegacy':true},
				'reviews' : {'title':'Customer Reviews','isLegacy':false},
				'rss' : {'title':'SEO and RSS Tools','isLegacy':false},
				'diagnostics' : {'title':'Troublshooting/Diagnostics/Advanced','isLegacy':true}
				},
	//when a panel is converted to app, add it here and add a template. 
			appPanels : ['general','shipping','rss','syndication','flexedit','reviews','images'], //a list of which panels do NOT use compatibility mode. used when loading panels. won't be needed when all app based.
			flexTypes : {
				'asin' : {'type':'text'},
				'textbox' : { 'type' : 'text'},
				'text' : { 'type' : 'text'},
				'textarea' : { 'type' : 'textarea'},
				'keywordlist' : { 'type' : 'textarea'},
				'textlist' : { 'type' : 'textarea'},
				'image' : { 'type' : 'image'},
				'finder' : { 'type' : 'button'},
				'keyword' : { 'type' : 'textarea'},
				'currency' : { 'type' : 'number'},
				'number' : { 'type' : 'number'},
				'weight' : { 'type' : 'text'},
				'checkbox' : { 'type' : 'checkbox'},
				'digest' : { 'type' : 'hidden'},
				'special' : { 'type' : 'hidden'},
				'boolean' : { 'type' : 'cb'},
				'chooser/counter' : { 'type' : 'text'},
	//			'ebay/storecat' :  {'type':'ebay/storecat'}, //not supported at this time.
				'ebay/attributes' : { 'type' : 'text'},
				'overstock/category' : { 'type' : 'text'},
				'select' : {'type':'select'},
				'selectreset' : { 'type' : 'select'} /* don't save a blank value. a selection is required. */
				}
			},



////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	
		callbacks : {
	//executed when extension is loaded. should include any validation that needs to occur.
			init : {
				onSuccess : function()	{
					var r = true; //return false if extension won't load for some reason (account config, dependencies, etc).
					app.rq.push(['css',0,app.vars.baseURL+'extensions/admin/product_editor.css','product_editor_styles']);
					app.model.fetchNLoadTemplates(app.vars.baseURL+'extensions/admin/product_editor.html',theseTemplates);
	//				window.savePanel = app.ext.admin.a.saveProductPanel; //for product editor. odd. this function doesn't exist. commented out by JT on 2012-11-27
					window.editProduct = app.ext.admin_prodEdit.a.showPanelsFor;
					return r;
					},
				onError : function()	{
	//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
	//you may or may not need it.
					app.u.dump('BEGIN admin_prodEdit.callbacks.init.onError');
					}
				},
	
			showMangementCats : {
				onSuccess : function(_rtag)	{
					$('#manCatsParent').show(); //make sure parent is visible. hidden by default in case there's no mancats
					var $results = $(app.u.jqSelector('#',_rtag.targetID)),
					$a, //recycled.
	//cats is an array of keys (management category names) used for sorting purposes.
	//regular sort won't work because Bob comes before andy because of case. The function normalizes the case for sorting purposes, but the array retains case sensitivity.
					cats = Object.keys(app.data[_rtag.datapointer]['%CATEGORIES']).sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());});
	//				app.u.dump(cats);
					for(var index in cats)	{
						$a = $("<a \/>").attr('data-management-category',cats[index]).html("<span class='ui-icon ui-icon-folder-collapsed floatLeft'></span> "+(cats[index] || 'uncategorized'));
	//In the app framework, it's not real practical to load several hundred product into memory at one time.
	//so the list is opened in the main product area in a multipage format.
							$a.click(function(){
								var $ul = $("<ul \/>").attr({'id':'manageCatProdlist','data-management-category':$(this).data('management-category')}),
								$target = $('#productTabMainContent').empty().append($ul),
	//convert to array and clean up extra comma's, blanks, etc.
	//also, sort alphabetically.
								csv = app.ext.store_prodlist.u.cleanUpProductList(app.data.adminProductManagementCategoryList['%CATEGORIES'][$(this).data('management-category')]).sort();
	
								app.ext.store_prodlist.u.buildProductList({
									'csv': csv,
									'parentID':'manageCatProdlist',
									'loadsTemplate' : 'productListTableListTemplate',
									'items_per_page' : 100
									},$ul);
								});
						$a.wrap("<li>");
						$results.append($a);
						}
					}
				}, //showManagementCats
	
	//executed after the list of panels for a given product are received (in the product editor).
	//Uses local storage to determine which panels to open and retrieve content for.
	//panelData is an object with panel ids as keys and value TFU for whether or not so load/show the panel content.
			loadAndShowPanels :	{
				onSuccess : function(_rtag)	{
	//				app.u.dump("BEGIN admin_prodEdit.callbacks.loadAndShowPanels");
	//the device preferences are how panels are open/closed by default.
					var settings = app.ext.admin.u.dpsGet('admin_prodEdit','openPanel');
	//				app.u.dump(" -> settings: "); app.u.dump(settings);
					settings = $.extend(true,settings,{"general":true}); //make sure panel object exits. general panel is always open.
	//				app.u.dump(" -> _rtag.datapointer: "+_rtag.datapointer);
					var pid = _rtag.pid;
	//				app.u.dump(" -> pid: "+pid);
					
					var
						$target = $('#productTabMainContent'),
						panels = app.data['adminUIProductPanelList']['@PANELS'],
						L = panels.length;
					
					$target.empty(); //removes loadingBG div and any leftovers.
					for(var i = 0; i < L; i += 1)	{
						var panelid = panels[i].id;
	//					app.u.dump(" -> panelid: "+panelid);
						if($.inArray(panelid,app.ext.admin_prodEdit.vars.appPanels) > -1)	{
							$target.append(app.ext.admin_prodEdit.u.getPanelContents(pid,panelid));
							} //this/these panels are now all app-based.
						else	{
						//pid is assigned to the panel so a given panel can easily detect (data-pid) what pid to update on save.
							$target.append(app.renderFunctions.transmogrify({'id':'panel_'+panelid,'panelid':panelid,'pid':pid},'productEditorPanelTemplate',panels[i]));
							}
						if(settings && settings[panelid])	{
							$('.panelHeader','#panel_'+panelid).click(); //open panel. This function also adds the dispatch.
							}
						}
					app.ext.admin.u.dpsSet('admin_prodEdit',"openPanel",settings); //update the localStorage session var.
					}
				}
			}, //callbacks




////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	
		a : {
	
//$target -> a jquery instance of where the manager should show up.
//P -> an object of params.
//  -> currently supports 'pid' which, if set, will open the product editor for that pid.
			showProductManager : function($target,P)	{
				P = P || {};
				//for legacy panels:
				window.savePanel = app.ext.admin_prodEdit.a.saveProductPanel;

				//always rewrite savePanel. another 'tab' may change the function.
				//kill any calls in progress so that if setup then product tabs are clicked quickly, setup doesn't get loaded.
				
				if(!$.isEmptyObject(app.ext.admin.vars.uiRequest))	{
					app.u.dump("request in progress. Aborting.");
					app.ext.admin.vars.uiRequest.abort(); //kill any exists requests. The nature of these calls is one at a time.
					}

				app.ext.admin_prodEdit.u.handleProductListTab('deactivate'); //will stickytab, if open.
				app.ext.admin_prodEdit.u.handleNavTabs(); //builds the filters, search, etc menu at top, under main tabs.
				app.ext.admin_prodEdit.u.handleManagementCategories();//handleManagementCategories 'may' add a dispatch.
				$target.empty();
				$target.anycontent({'templateID':'productManagerLandingContentTemplate','showLoading':false});
				app.u.handleEventDelegation($('#productTabMainContent'));


				if(P.pid)	{app.ext.admin_prodEdit.a.showPanelsFor(P.pid)} //if a pid is specified, immediately show the editor for that pid.
				else if(!path || path == '/biz/product/index.cgi' || path == '/biz/product/edit.cgi?VERB=WELCOME')	{
					//do nothing. product page template has initial load content.
					}

				app.model.dispatchThis('mutable');
				},

			showProductEditor : function($target,pid)	{
				if($target instanceof jQuery && pid)	{
//					this.showPanelsFor(pid); //!!! tmp. will want a new function here.
// !!! NOT DONE YET.
//Loop through the list of panels and display them in the default order.  Then use some JS magic to change the order based on what is in DPS.
var panels = app.ext.admin_prodEdit.vars.panels; //shortcut.
//					var panelSequence = app.ext.admin.u.dpsGet('admin_prodEdit',"panelOrder");
for(var index in panels)	{
	$target.append(app.renderFunctions.createTemplateInstance('productEditorPanelTemplate').anypanel());
	}
					}
				else	{
					$('#globalMessaging').anymessage({"message":"In admin_prodEdit.a.showProductEditor, either $target is not an instance of jquery or pid is not set.","gMessage":true});
					}
				},


			showCreateProductDialog : function(){
				var $modal = $('#createProductDialog');
				if($modal.length < 1)	{
					$modal = $("<div>").attr({'id':'createProductDialog','title':'Create a New Product'});
					$modal.appendTo('body');
					$modal.dialog({width:600,height:500,modal:true,autoOpen:false});
					}
				$modal.empty().append(app.renderFunctions.createTemplateInstance('ProductCreateNewTemplate'))
				$modal.dialog('open');
				}, //showCreateProductDialog
	
	//t is 'this' passed in from the h3 that contains the icon and link.
	//run when a panel header is clicked. a 'click' may be triggered by the app when the list of panels appears.
	//view can equal 'show' or 'hide'. This is to force a panel open or closed. if blank, panel will toggle.
			handlePanel : function(t)	{
	//			app.u.dump("BEGIN admin_prodEdit.a.handlePanel");
				
				var $header = $(t), //if not already a jquery object
				$panel = $('.panelContents',$header.parent()),
				pid = $panel.data('pid'),
				panelid = $header.parent().data('panelid'),
				settings = app.ext.admin.u.dpsGet('admin_prodEdit',"openPanel");
	
				settings = $.extend(true,settings,{"general":true}); //make sure panel object exits. general panel is always open.
	
				$panel.toggle(); //will close an already opened panel or open a closed. the visibility state is used to determine what action to take.
	
				if($panel.is(":visible"))	{
	//				app.u.dump(" -> into the code to show the panel");
					settings[panelid] = true;
					$header.addClass('ui-accordion-header-active ui-state-active').removeClass('ui-corner-bottom');
					$('.ui-icon-circle-arrow-e',$header).removeClass('ui-icon-circle-arrow-e').addClass('ui-icon-circle-arrow-s');
	//panel contents generated already. just open. form and fieldset generated automatically, so check children of fieldset not the panel itself.
					if($('fieldset',$panel).children().length > 0)	{} 
	//default to getting the contents. better to take an API hit then to somehow accidentally load a blank panel.
					else if(app.ext.admin_prodEdit.vars.appPanels.indexOf(panelid) > -1)	{
	//panel is app based, do nothing extra.
						}
					else	{
						app.ext.admin.calls.adminUIProductPanelExecute.init({'pid':$('#panel_'+panelid).data('pid'),'sub':'LOAD','panel':panelid},{'callback':'showDataHTML','extension':'admin','targetID':'panelContents_'+app.u.makeSafeHTMLId(panelid)},'mutable');
						app.model.dispatchThis('mutable');
						}
					}
				else	{
					settings[panelid] = false;
					$header.removeClass('ui-accordion-header-active ui-state-active').addClass('ui-corner-bottom');
					$('.ui-icon-circle-arrow-s',$header).removeClass('ui-icon-circle-arrow-s').addClass('ui-icon-circle-arrow-e')
					}
	
				app.ext.admin.u.dpsSet('admin_prodEdit',"openPanel",settings); //update the localStorage session var.
				},
	
	//t = this, which is the a tag, not the li. don't link the li or the onCLick will get triggered when the children list items are clicked too, which would be bad.
			toggleManagementCat : function(t,manCatID){
				var $parent = $(t).parent(); //used to append the new UL to.
				
				var targetID = 'manCats_'+app.u.makeSafeHTMLId(manCatID);
				var $target = $(app.u.jqSelector('#',targetID));
	//if target already exists on the DOM, then this category has been opened previously. The target is the UL containing the product list.
				if($target.length)	{
					$target.toggle();
					}
				else	{
					$target = $("<ul \/>").attr('id',targetID).appendTo($parent);
	//for a full list of what vars can/should be set in buildProductList, see store_prodlist.u.setProdlistVars
					app.ext.store_prodlist.u.buildProductList({
						'csv': app.data.adminProductManagementCategoryList['%CATEGORIES'][manCatID],
						'hide_summary': true,
						'parentID':targetID,
						'loadsTemplate' : 'productListTemplateEditMe',
						'items_per_page' : 100
						},$target);
					}
				}, //toggleManagementCat
				
	//used for saving compatibility mode panels. app panels have a ui-event
			saveProductPanel : function(t,panelid,SUB){
				var $form = $(t).closest("form");
				var $fieldset = $('fieldset',$form); // a var because its used/modified more than once.
				var formObj = $form.serializeJSON();
	
				//if pid is set as a input in the original form, use it. Otherwise, look for it in data on the container.
				formObj.pid = formObj.pid || $form.closest('[data-pid]').attr('data-pid');
				
				formObj['sub'] = (SUB) ? SUB : 'SAVE';
				formObj.panel = panelid;
	
				if(formObj.pid)	{
					// fieldset is where data is going to get added, so it gets the loading class.
					// be sure do this empty AFTER the form serialization occurs.
					$fieldset.empty().addClass('loadingBG');
					app.ext.admin.calls.adminUIProductPanelExecute.init(
						formObj,
						{'callback':'showDataHTML','extension':'admin','targetID':$fieldset.attr('id')}
						,'immutable');
					app.model.dispatchThis('immutable');
					}
				else	{
					app.u.throwMessage("Uh oh. an error occured. could not determine what product to update.");
					}
				}, //saveProductPanel
	
	//call executed to open the editor for a given pid.
	//legacy call for panel list is needed (for now). productGet is used for panels as they're upgraded to full-app 
			showPanelsFor : function(pid)	{
				$('#productTabMainContent').empty().append("<div class='loadingBG'></div>");
	
	//the data for BOTH these requests is needed before the panel list can correctly load.
	
	//			app.calls.adminProductDetail.init({'pid':pid,'skus':true,'variations':true},{},'mutable'); //get into memory for app-based panels.
	//though a pid is required to 'get' this data, it's always the same. just get it once.
				if(app.model.fetchData('adminUIProductPanelList'))	{}
				else	{
					app.model.addDispatchToQ({"_cmd":"adminUIProductPanelList","_tag":{'datapointer':'adminUIProductPanelList'},"pid":pid},'mutable');
					}
				app.ext.admin.calls.appResource.init('product_attribs_popular.json',{},'mutable');
				app.ext.admin.calls.appResource.init('product_attribs_all.json',{},'mutable');
	//flexedit data is necessary for that panel.
				if(app.model.fetchData('adminConfigDetail|flexedit'))	{}
				else	{
					app.model.addDispatchToQ({
						'_cmd':'adminConfigDetail',
						'flexedit' : 1,
						'_tag':	{'datapointer':'adminConfigDetail|flexedit'}
						},'mutable');
					}
	
	
	app.model.addDispatchToQ({
		'_cmd':'adminProductNavcatList',
		'pid':pid,
		'_tag':	{
			'datapointer' : 'adminProductNavcatList|'+pid,
			'pid':pid
			}
		},'mutable');
	
	
	app.model.addDispatchToQ({
		'_cmd':'adminProductDetail',
		'variations' : true,
		'skus' : true,
	//	'inventory' : true, //inventory
		'pid':pid,
		'_tag':	{
			'datapointer' : 'adminProductDetail|'+pid,
			'callback': 'loadAndShowPanels',
			'pid':pid,
			'extension':'admin_prodEdit'
			}
		},'mutable');
	app.model.dispatchThis('mutable');
	
	
				},
	
			showStoreVariationsManager : function($target)	{
	//			app.u.dump("BEGIN admin_prodEdit.a.showStoreVariationsManager");
				if($target && $target instanceof jQuery)	{
					var _tag = {
						'datapointer' : 'adminSOGComplete',
						'callback':'anycontent',
						'jqObj' : $target,
						'templateID' : 'variationsManagerTemplate'
						}
					
					$target.empty()
					
					//use local copy, if available
					if(app.model.fetchData('adminSOGComplete'))	{
						app.u.handleCallback(_tag)
						}
					else	{
						$target.showLoading({"message":"Fetching Variations..."});
						app.model.addDispatchToQ({
							'_cmd':'adminSOGComplete',
							'_tag':	_tag
							},'mutable');
						app.model.dispatchThis('mutable');
						}
	
					}
				else	{
					$('#globalMessaging').anymessage({"message":"In admin_prodEdit.a.showStoreVariationsManager, $target was either not specified or is not an instance of jQuery.","gMessage":true});
					}
				}, //showStoreVariationsManager
				
	//mode = store or product.
	//varObj = variation Object.
	//PID is required for mode = product.
	//executed when 'edit' is clicked from either sog list in store variation manager or in product edit > variations > edit variation group.
			getVariationEditor : function(mode, varObj, PID)	{
	//			app.u.dump("BEGIN admin_prodEdit.u.getVariationEditor");
				varObj = varObj || {}; //defauilt to object to avoid JS error in error checking.
				var $r = $("<div \/>").addClass('variationEditorContainer'); //what is returned. Either the editor or some error messaging.
				if(!$.isEmptyObject(varObj) && (mode == 'store' || (mode == 'product' && PID)) && varObj.type){
	//				app.u.dump(" -> mode: "+mode);
	//				app.u.dump(" -> varObj:"); app.u.dump(varObj);
	// * 201332 -> make sure ispog is set.
					varObj.ispog = varObj.ispog || (varObj.id && varObj.id.charAt(0) == '#') ? true : false;
					
					$r.data({
						'variationtype':varObj.type,
						'variationmode':mode,
						'variationguid' : varObj.guid,
						'variationid' : varObj.id,
						'ispog' : varObj.ispog,
						'isnew' : varObj.isnew
						});
					if(PID)	{
						varObj.pid = PID; //add pid to object so it can be used in data-binds.
						$r.data('pid',PID); //used in save function.
						} 
					//build the generic editor.
					$r.anycontent({'templateID':'variationEditorTemplate','data':varObj});
					//add the editor specific to the variation type.
					$("[data-app-role='variationsTypeSpecificsContainer']",$r).anycontent({'templateID':'variationsEditor_'+varObj.type.toLowerCase(),'data':varObj})
	//				app.u.dump(" -> varObj");app.u.dump(varObj);
					
					if(mode == 'product')	{
	//when editing a sog, the save button actually makes an api call. when editing 'product', the changes update the product in memory until the save button is pushed.
						$("[data-app-role='saveButton']",$r).text('Apply Changes').attr('title','Apply changes to variation - will not be saved until save changes in variation manager is pushed.');
						}
	
					
					app.u.handleAppEvents($r);
					$('.toolTip',$r).tooltip();
	
	//for 'select' based variations, need to add some additional UI functionality.
					if(app.ext.admin_prodEdit.u.variationTypeIsSelectBased(varObj.type))	{
						$("[data-app-role='variationsOptionsTbody']",$r).addClass('sortGroup').sortable();
						$("[data-app-role='variationsOptionsTbody'] tr",$r).each(function(){
							var $tr = $(this);
							$tr.attr('data-guid','option_'+$tr.data('v')) //necessary for the dataTable feature to work. doesn't have to be a 'true' guid. option_ prefix is so option value 00 doesn't get ignored.
							})
	//in 'select' based varations editors and in product edit mode, need to show the list of options available in the sog
	//app.u.dump(varObj);
	//app.u.dump(" -> "+varObj.id+".indexOf('#'): "+varObj.id.indexOf('#'));
	//
						if(mode == 'product' && ((varObj.isnew && varObj.ispog) || (varObj.id && varObj.id.indexOf('#') == -1)))	{
							var $tbody = $("[data-app-role='storeVariationsOptionsContainer'] tbody",$r);
							$tbody.attr("data-bind","var: sog(@options); format:processList;loadsTemplate:optionsEditorRowTemplate;");
							$tbody.parent().show().anycontent({'data':app.data.adminSOGComplete['%SOGS'][varObj.id]});
	//						$('button',$tbody).hide();
							$("[data-app-event='admin_prodEdit|variationsOptionToggle']",$tbody).show(); //toggle button only shows up when in right side list.
							app.u.handleAppEvents($("[data-app-event='admin_prodEdit|variationsOptionToggle']",$tbody).andSelf());
							$tbody.sortable({
								connectWith: '.sortGroup',
								stop : function(event,ui){
									var $tr = $(ui.item);
									if($tr.closest('table').data('app-role') == "storeVariationsOptionsContainer")	{} //same parent. do nothing.
									else	{
										//moved to new parent.
										$('button',$tr).show();
										$("[data-app-event='admin_prodEdit|variationsOptionToggle']",$tr).hide();
										app.u.handleAppEvents($tr);
										}
									//optionsEditorRowTemplate
									}
								});
							//now hide all the options in the 'global' list that are already enabled on the product.
							$("tbody[data-app-role='variationsOptionsTbody'] tr",$r).each(function(){
								app.u.dump(" -> $(this).data('v'): "+$(this).data('v'));
								$("[data-v='"+$(this).data('v')+"']",$tbody).empty().remove(); //removed instead of just hidden so that css even/odd works. also, not necessary on DOM for anything.
								})
							//data-v="00"			
							}
						
						
						}
	//* 201332 -> when editing a sog, 'variation settings' are not displayed.
					if(mode == 'product' && !varObj.ispog)	{
						$("[data-app-role='variationSettingsContainer']",$r).hide(); //
						$('.variationEditorSplitter',$r).hide();
						}
	
					if(varObj.inv == 0)	{
						$("[data-app-role='variationOptionalContainer']",$r).removeClass('displayNone');
						}
					
					if(varObj.type == 'imgselect' || varObj.type == 'imggrid')	{
						$("[data-app-role='variationImgInputs']",$r).removeClass('displayNone');
						}
					else	{
						$("[data-app-role='variationImgInputs']",$r).empty().remove();
						}
					
					}
				else	{
					$r.anymessage({"message":"In admin_prodEdit.a.getVariationEditor, either mode ["+mode+"] or type["+varObj.type+"] was blank, varOjb was empty ["+$.isEmptyObject(varObj)+"] or mode was set to product and PID ["+PID+"] was empty.","gMessage":true});
					}
				return $r;
				}, //getVariationEditor
	
	// opened when editing a product. shows enabled options and ability to add store variations to product.
			showProductVariationManager : function($target,pid)	{
				app.u.dump("BEGIN admin_prodEdit.a.showProductVariationManager. pid: "+pid);
				
				if($target instanceof jQuery && pid)	{
					$target.empty().anycontent({
						'templateID':'productVariationManager',
						'showLoading':false,
						data : {'pid':pid},
						'dataAttribs':{'pid':pid}
						});
					$target.showLoading({"message":"Fetching Product Record and Store Variations"});
	
	//Need both the product data and the entire sog list. Need both of these to be up to date.
	app.model.addDispatchToQ({'_cmd':'adminSOGComplete','_tag': {'datapointer':'adminSOGComplete'}},'mutable');
	app.model.addDispatchToQ({'_cmd':'adminProductDetail','variations':1,'skus':1,'pid' : pid,'_tag':{'datapointer':'adminProductDetail|'+pid,'callback':function(rd){
		$target.hideLoading();
		if(app.model.responseHasErrors(rd)){
			$('#globalMessaging').anymessage({'message':rd});
			}
		else	{
	
			var $prodOptions = $("[data-app-role='productVariationManagerProductContainer']",$target);
			$prodOptions.anycontent({'data':app.data[rd.datapointer]})
			$('.gridTable tbody',$prodOptions).sortable({
				'stop' : function(e,ui){
					app.u.dump('stop triggered');
					if(Number(ui.item.data('inv')) > 0 && !ui.item.closest('table').data('shown_inv_warning'))	{
						ui.item.closest('table').data('shown_inv_warning',true); //only show warning once per varation edit session.
						ui.item.closest("[data-app-role='productVariationManagerContainer']").anymessage({"message":"A product Stock Keeping Unit (SKU) is determined by the variation order of inventory-able variations, which you have just changed. Saving this change will alter your SKU. Proceed with caution.<br />note - you can change the order of non-inventory-able variations around the inventory-able variations with no concern."});
						$(window).scrollTop(ui.item.closest("[data-app-role='productVariationManagerContainer']").position().top)
						}
					$("[data-app-role='saveButton']",'#productTabMainContent').addClass('ui-state-highlight');}
				}); //rows are draggable to specify variation order.
			
			var $storeOptions = $("[data-app-role='productVariationManagerStoreContainer']",$target);
			$('tbody',$storeOptions).empty(); //tmp fix. time permitting, remove this and determine why content is being double-added. ###
			$storeOptions.anycontent({'data':app.data.adminSOGComplete});
			$('.gridTable',$storeOptions).anytable(); //make header click/sortable to make it easier to find sogs.
			
			app.u.handleAppEvents($target,{'pid':pid});
	// compare the sog list and the variations on the product and disable the buttons.
	// this avoids the same SOG being added twice.
			$('tbody tr',$prodOptions).each(function(){
				var $tr = $(this);
				if($tr.data('id') && $tr.data('id').charAt('0') != '#')	{ //ignore pogs.
					$("tr[data-id='"+$tr.data('id')+"']",$storeOptions).find('button').button('disable'); //disable 'add to product' button if already enabled on the product.
	//				$("tr[data-id='"+$tr.data('id')+"']",$storeOptions).hide();  //don't use this. causes alternating colors to get messed up.
					}
				})
			
			}		
		}}},'mutable');
	app.model.dispatchThis('mutable');
	
					}
				else	{
					$('#globalMessaging').anymessage({"message":"In admin_prodEdit.a.getProductVariationManager, either $target not specified or PID ["+PID+"] was left blank.","gMessage":true});
					}
				} //showProductVariationManager
	
			},
	
	////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	
	
		renderFormats : {
			
			prodImages : function($tag,data)	{
	//			app.u.dump("BEGIN admin_prodEdit.renderFormat.prodImages");
				var L = data.bindData.max || 99;
	//			app.u.dump(" -> data.value: "); app.u.dump(data.value);
				for(var i = 1; i <= 30; i += 1)	{
					var imgName = data.value['%attribs']['zoovy:prod_image'+i];
					var w = data.bindData.w || 75;
					var h = data.bindData.h || 75;
					var b = data.bindData.b || 'ffffff';
	//				app.u.dump(" -> imgName: "+imgName);
					if(app.u.isSet(imgName))	{
						$tag.append("<li><a title='"+imgName+"'><img src='"+app.u.makeImage({'tag':0,'w':w,'h':h,'name':imgName,'b':b})+"' width='"+w+"' height='"+b+"' alt='"+imgName+"' title='"+imgName+"' data-originalurl='"+app.u.makeImage({'tag':0,'w':'','h':'','name':imgName,'b':'ffffff'})+"' data-filename='"+imgName+"' \/><\/a><\/li>");
						//data-filename on the image is used in the 'save' in the product editor - images panel.
						}
					else	{break;} //exit once a blank is hit.
					}
				},
			
	//Management categories (mancats) is an array where the key is the category ID and the value is a list of product.
	//This function sorts the list alphabetically and puts the key, product and lenght into an associative array before running it through the translates.
	//
	//regular sort won't work because Bob comes before andy because of case. The function normalizes the case for sorting purposes, but the array retains case sensitivity.
	//uses a loadsTemplate Parameter on the data-bind to format each row.
	// * 201330 -> not used anywhere. delete later if nothing was missed.
	/*		manageCatsList : function($tag,data)	{
	
					var cats = Object.keys(data.value).sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());});
	//				app.u.dump(cats);
					for(var index in cats)	{
						if(cats[index])	{
	//						app.u.dump(" -> index: "+cats[index]);
	//						app.u.dump(" -> data.value[index]: "+data.value[cats[index]]);
							var obj = {'MCID':cats[index], 'product_count' : data.value[cats[index]].length, '@product' : data.value[cats[index]]}
							$o = app.renderFunctions.transmogrify({'mcid':index},data.bindData.loadsTemplate,obj);
							$tag.append($o);
							}
						}
	
				},
	*/		
			bigListOptions : function($tag,data){
				var L = data.value.length;
				for(var i = 0; i < L; i += 1)	{
					if(i > 0)	{$tag.append("\n")} //hard line separators but don't want orphan whitespace in textarea
					$tag.append(data.value[i].prompt)
					}
				},
			
			assemblyList : function($tag,data)	{
				for(i in data.value)	{
					if(i.indexOf(':') == -1)	{} //not a variation. do nothing.
					else	{
						$tag.append("<li><label><span>"+i+"</span> <input type='text' name='"+i+"' value='' /></label></li>");
						}
					}
				if($tag.children().length)	{
					$tag.parent().removeClass('displayNone');
					}			
				}
			
			}, //renderFormats
	
	
	////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	
	
		u : {

//** 201334 -> for new product manager interface.
			handleNavTabs : function()	{
				app.ext.admin.u.uiHandleNavTabs({}); //will clear out navtabs area.
				var $navtabs = $('#navTabs');// tabs container
//the div is created to contain navtab content so that events and anycontent can be attached to it instead of navtabs (which means everything is dropped when navtabs is cleared, which is better for navigating between tabs.
				var $div = $("<div \/>");
				$div.anycontent({'templateID':'productEditorNavtabsTemplate','data':{}});
				$div.appendTo($navtabs);

				$('button',$div).each(function(){
					var $button = $(this);
					$button.button();
					if($button.data('app-class'))	{
						$button.button({text: ($button.data('app-text')) ? true : false,icons: {primary: $button.data('app-class')}})
						}
					});


				var $filterMenu = $navtabs.find("[data-app-role='productManagerFilters']");
				$filterMenu.css({'position':'absolute','top':'33px','left':0,'right':0,'z-index':'1000'});
				//set css for management categories menu.
				
			
				$('.mktFilterList, .tagFilterList',$filterMenu).selectable();
				$('button',$filterMenu).button();
				$( ".sliderRange" ).slider({
					range: true,
					min: 0,
					max: 500,
					values: [ 75, 300 ],
					slide: function( event, ui ) {
						$("[data-app-role='priceFilterRange']",$filterMenu).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
						}
					});
				$( "[data-app-role='priceFilterRange']" ).val( "$" + $( ".sliderRange" ).slider( "values", 0 ) + " - $" + $( ".sliderRange" ).slider( "values", 1 ) );

				app.u.handleEventDelegation($div);
				},

//** 201334 -> for new product manager interface.
			handleManagementCategories : function()	{
//				app.u.dump("BEGIN admin_prodEdit.u.handleManagementCategories");
				var $navtabs = $('#navTabs');// tabs container
				var $manCatsContainer = $navtabs.find("[data-app-role='productManagerManCats']");
				var $manCatsList = $("[data-app-role='managementCategoryList']",$manCatsContainer);
				
//				app.u.dump(" -> $manCatsList.length: "+$manCatsList.length);
				if($manCatsList.children().length)	{} //already rendered management categories.
				else	{
					$manCatsContainer.css({'position':'absolute','top':'33px','left':0,'right':0,'z-index':'1000'});
					var cmdObj = {
						_cmd : "adminProductManagementCategoryList",
						_tag : {
							callback : function(rd){
//								app.u.dump(" -> executing callback for management categories request");
								if(app.model.responseHasErrors(rd)){
									$('#globalMessaging').anymessage({'message':rd});
									}
								else	{
									var $ul = $("<ul \/>"); //add list items to this, then move to $manCatsList after. decreases DOM updates which is more efficient.
									if(!$.isEmptyObject(app.data.adminProductManagementCategoryList['%CATEGORIES']))	{
										var cats = Object.keys(app.data[rd.datapointer]['%CATEGORIES']).sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());});
										for(var index in cats)	{
											$ul.append($("<div \/>").addClass('lookLikeLink').attr('data-app-click','admin_prodEdit|managementCatsProdlistShow').data('management-category',cats[index]).html("<span class='ui-icon ui-icon-folder-collapsed floatLeft'></span> "+(cats[index] || 'uncategorized')));
											}
//										app.u.dump(' -> $ul.children().length: '+$ul.children().length);
										$manCatsList.append($ul.children());
										}
									else	{
										//successful call, but no management categories exist. do nothing.
										}
									}
								},
							datapointer : 'adminProductManagementCategoryList'
							}
						}
					if(app.model.fetchData('adminProductManagementCategoryList'))	{
						app.u.handleCallback(cmdObj._tag)
						}
					else	{
						app.model.addDispatchToQ(cmdObj,'mutable');
						}

					
					}
				
				}, //handleManagementCategories
	
	
	//type is an input type.  number, select, textarea or something specific to us, like finder, media, etc.
	//data is the individual flexedit piece of data. an object w/ id, type, title set. This is a combo of what came from merchant data and the global settings.
	//prodData is an optional object. should be adminProductDetail and include %attribs, inventory, etc.
			flexBuildInput : function(type,data,prodData)	{
	//			app.u.dump("BEGIN admin_prodEdit.u.flexBuildInput. type: "+type);
			
			//	app.u.dump('TYPE: '+type); app.u.dump(data);
				var $r;
				
				if(data.sku)	{
					$r = $("<div \/>").data(data).addClass('label');
					$r.append($("<div \/>").attr('title',data.id).text(data.title || data.id));
					if(data.hint)	{$r.find('div').append($("<span class='toolTip' title='"+data.hint+"'>?<\/span>"))}
					
	//				$r.append($("<div \/>").anymessage({'message':'No editor for SKU level fields yet.'}));
					var L = prodData['@skus'].length;
	//				app.u.dump(" -> data.id: "+data.id);
					for(var i = 0; i < L; i += 1)	{
						$("<label \/>",{'title':data.id}).html("<span>"+prodData['@skus'][i].sku+"<\/span>").append("<input type='text' class='handleAsSku' size='20' name='"+data.id+"|"+prodData['@skus'][i].sku+"' value='"+(prodData['@skus'][i]['%attribs'][data.id] || "")+"' \/>").appendTo($r);
						}
					}
				else	{
	
					$r = $("<label \/>").data(data);
					prodData = prodData || {'%attribs':{}};
					$r.append($("<span \/>").attr('title',data.id).text(data.title || data.id));
					if(data.hint)	{$r.find('span').append($("<span class='toolTip' title='"+data.hint+"'>?<\/span>"))}
	
					if(type == 'textarea')	{
						var $textarea = $("<textarea \/>",{'name':data.id,'rows':data.rows || 5, 'cols':data.cols || 40});
						
						$textarea.val(prodData['%attribs'][data.id] || "");
						if(data.type == 'textlist')	{
							if(data.startsize)	{
								$textarea.attr('rows',data.startsize);
								$textarea.on('focus',function(){
									$textarea.attr('rows',$data.max || 10);
									}).on('blur',function(){
										$textarea.attr('rows',data.rows || 5)
										});
								$('.toolTip',$r).append(" Only 1 entry per line.");
								}
							}
						
						$textarea.appendTo($r);
						}
		/*			else if(type == 'ebay/storecat')	{
		//				$r.append("not done yet");
						var $input = $("<input \/>",{'type':'text','size':'9','name':data.id})
						$input.val(prodData['%attribs'][data.id] || "");
						$input.appendTo($r);
						
		//$("<button>Chooser</button>").on('click',function(){
		//	app.ext.admin_syndication.a.showEBAYCategoryChooserInModal($input,{'pid':'MODEL10','categoryselect':'primary'},jQuery(app.u.jqSelector('#','ebay:category_name')));
		//	}).appendTo($r);				
						}
		*/			else if(type == 'select')	{
						var $select = $("<select \/>",{'name':data.id});
						//data-reset requires a value.
						if(data.type == 'select')	{
							$select.append($("<option \/>",{'value':''}).text(""));
							}
						
						if(data.options)	{
							var L = data.options.length;
							
							
							for(var i = 0; i < L; i += 1)	{
								$select.append($("<option \/>",{'value':data.options[i].v}).text(data.options[i].p));
								}
							
							$select.val(prodData['%attribs'][data.id] || "");
			// now take a look and see if the value set for this attrib is valid. respond accordingly.
							if($("option[value='"+prodData['%attribs'][data.id]+"']").length)	{} //value exists, no worries.
							else if(data.type == 'selectreset')	{ //selected value isn't valid. reset to first option.
								$r.anymessage({'message':'The value for '+data.id+' was invalid and this input requires a valid match. On save, this value will change to '+data.options[0].v});
								$select.val(data.options[0].v)
								}
								//prodData['%attribs'][data.id] is checked so no error is thrown if the value is blank.
							else if(data.type == 'select' && prodData['%attribs'][data.id])	{
								$r.anymessage({'message':'The value for '+data.id+' does not have a match in the default list of options for this attribute. Your value may not be right, but will be preserved on save unless you correct it.'});
								$select.append($("<option \/>",{'value':prodData['%attribs'][data.id]}).text("!!! invalid: "+prodData['%attribs'][data.id]));
								}
							else	{} //how the F did we get here?
							}
						$select.appendTo($r);
						}
					else if(type == 'button')	{
						var $btn = $("<button \/>").text(data.title || data.id);
						$btn.button();
						if(data.type == 'finder')	{
							if(prodData.pid)	{
								$btn.button().on('click',function(event){
									event.preventDefault();
									app.ext.admin.a.showFinderInModal('PRODUCT',prodData.pid,data.id);
									})
								}
							else	{
								$btn.button('disable');
								}
							}
						else	{
							$btn.button('disable');
							}
						$btn.appendTo($r);
						}
					else if(type == 'image')	{
						var $input = $("<input \/>",{'type':'hidden','name':data.id}).val(prodData['%attribs'][data.id]);
	//					app.u.dump(" -> prodData['%attribs'][data.id]: "+prodData['%attribs'][data.id]);
						var $image = $(app.u.makeImage({'w':'75','h':'75','alt':'','tag':true,'name':(prodData['%attribs'][data.id] || null)}));
		
						//return false; 				
						$input.appendTo($r);
						$image.appendTo($r);
						
						$("<button \/>").button().on('click',function(event){
							event.preventDefault();
							mediaLibrary($image,$input,'');
							}).text('Select').appendTo($r);
						
						$("<button \/>").button().on('click',function(event){
							event.preventDefault();
							$image.attr('src','/images/blank.gif');
							$input.val('');
							}).text('Clear').appendTo($r);
						}
					else	{
						var $input = $("<input \/>",{'type':type,'name':data.id});
						if(type == 'checkbox' && prodData['%attribs'][data.id])	{
							$input.prop('checked','checked')
							} // !!! hhhmmmm may need to tune this.
						else {
							$input.val(prodData['%attribs'][data.id] || "");
							$input.attr('size',data.size || 20); //do this early, then change for specific types, if necessary.
							if(data.type == 'currency')	{
								$input.attr({'step':'.01','min':'0.00','size':6})
								}
							
							if(type == 'number' || data.type == 'weight')	{
								$input.attr('size', data.size || 6); //default to smaller input for numbers, if size not set.
								}
							
							if(data.maxlength)	{
								$input.attr('maxlength',data.maxlength);
								}
							
							}
						$input.appendTo($r);
						}
					}
	
	
				
				return $r;
	
	
				}, //flexBuildInput
	
			flexJSON2JqObj : function(thisFlex,prodData)	{
				var r = $("<div \/>");; //what is returned. Either a chunk of html or an error message.
				if(thisFlex && typeof thisFlex === 'object')	{
					
					var	L = thisFlex.length;
					prodData = prodData || {};
						
					
					for(var i = 0; i < L; i += 1)	{
						if(thisFlex[i].id)	{
	//						app.u.dump("ID: "+thisFlex[i].id);
							var gfo = app.data['appResource|product_attribs_all.json'].contents[thisFlex[i].id] || {}; //Global Flex Object. may be empty for custom attributes.
							var type = thisFlex[i].type || gfo.type;
							if(type && app.ext.admin_prodEdit.vars.flexTypes[type] && app.ext.admin_prodEdit.vars.flexTypes[type].type)	{
								r.append(app.ext.admin_prodEdit.u.flexBuildInput(app.ext.admin_prodEdit.vars.flexTypes[type].type,$.extend(true,{},gfo,thisFlex[i]),prodData)) //thisFlex merged into gfo with precedence set of thisFlex attributes. 
								}
							else	{
	//							app.u.dump(' -> no valid editor.');
								r.append($("<div \/>").anymessage({
									'message':'Could not find valid editor for this input.  flex input type = '+type+' and typeof flexTypes[type] = '+typeof app.ext.admin_prodEdit.vars[type]}));					
								}
							}
						else	{
							app.u.dump(' -> no ID set');
							r.append($("<div \/>").anymessage({'message':'No ID set for this input.'}));
							}
						$('.toolTip',r).tooltip();
						}
					}
				else	{
					r.anymessage({message:'In flex2Form, thisFlex was either empty or not an object.','gMessage':true});
					}
				return r;
				}, //flexJSON2JqObj
	
			handleProductListTab : function(process)	{
	//			app.u.dump("BEGIN admin_prodEdit.u.handleProductListTab ["+process+"]");
				var
					$target = $('#productListTab'),
					$table = $('#prodEditorResultsTable')
	
				if($target.length)	{
	//				app.u.dump('sticky tab already exists');
					if(process == 'activate')	{}
					else if(process == 'deactivate'){
	//					app.u.dump(' -> destroy stickytab');
						$table.stickytab('destroy');
						}
					else	{} //unknown process
	
					
					}
				else if(process == 'activate')	{
					$table.stickytab({'tabtext':'product results','tabID':'productListTab'});
	//make sure buttons and links in the stickytab content area close the sticktab on click. good usability.
					$('button, a',$table).each(function(){
						$(this).off('close.stickytab').on('click.closeStickytab',function(){
							$table.stickytab('close');
							})
						})
	
					}
				else	{
					//do nothing. process is unknown OR de-activate and sticktab not active yet.
					}
				}, //handleProductListTab
	
			getReviewsPanelContents : function(pid)	{
				var $r = $("<div \/>"); //what is returned. either panel contents or false.
				$r.anycontent({'templateID':'productEditorPanelTemplate_reviews'});
				return $r;
				},
	
			getImagesPanelContents : function(pid,panelid)	{
				var r;
	
				app.u.dump("BEGIN admin_prodEdit.u.getImagesPanelContents");
				r = app.renderFunctions.transmogrify({'id':'panel_'+panelid,'panelid':panelid,'pid':pid},'productEditorPanelTemplate_'+panelid,app.data['adminProductDetail|'+pid]);
	
	
	//once translated, tag the product imagery container with the current # of images. This is used in the save to make sure if there are fewer images at save than what was present at start, the appropriate images are 'blanked' out.
				var $prodImageUL = $("[data-app-role='prodImagesContainer']",r);
				$prodImageUL.attr('data-numpics',$prodImageUL.children().length);
				
	
	//@skus will always have one record. Sku specific imagery are only necessary if MORE than one sku is present and, even then, the record for the pid itself doesn't need sku specific images. if an item DOES have options, 'pid' ( by itself ) won't appear in the inventory record.
				if(app.data['adminProductDetail|'+pid] && app.data['adminProductDetail|'+pid]['@skus'] && app.data['adminProductDetail|'+pid]['@skus'].length > 1)	{
	//						app.u.dump(" -> More than one sku is present.");
					$prodImageUL.width('60%'); //width is only applied IF right column (sku imagery) is present.
					var $container = $("[data-app-role='prodEditSkuImagesContainer']",r).show();
					var skus = app.data['adminProductDetail|'+pid]['@skus']; //shortcut
					var L = skus.length;
					var $table = $("<table \/>").addClass('gridTable').appendTo($container);
					for(var i = 0; i < L; i += 1)	{
						var $tr = app.renderFunctions.transmogrify(skus[i],'prodEditSKUImageTemplate',skus[i])
						$tr.appendTo($table);
						}
					}
	
				app.ext.admin.u.handleAppEvents(r);
	
	
	//images are sortable between lists. When an image is dropped, it is cloned in the new location and reverted back in the original.
				$(".sortableImagery",r).sortable({
					'items' : 'li:not(.dropzone)',
					'appendTo' : r,
					'cancel' : '.ui-icon', //if an icon is the drag start (such as clear image) do not init sort on element.
					'containment' : r,
					'placeholder' : 'ui-state-highlight positionRelative marginRight marginBottom floatLeft',
					'forcePlaceholderSize' : true,
					'cursor' : "move",
					'cursorAt' : { left: 5 },
					'connectWith' : '.sortableImagery',
					'stop' : function(event,ui)	{ui.item.addClass('edited')},
					'remove' : function(event, ui) {
						ui.item.after(ui.item.clone().addClass('edited'));//clone the dropped item into the new parent at the drop index.
						$(this).sortable('cancel'); //cancel the move so the image stays where it was originally.
						},
					'revert' : true
					});
	
				$(".sortableImagery",r).anydropzone({
					folder : 'product/'+pid.toLowerCase(),
					drop : function(files,event,self){
	
						for (var i = 0; i < files.length; i++) {
							var file = files[i];
							var imageType = /image.*/;
			
							if (!file.type.match(imageType)) {
								continue;
								}
							var $target = self.element;
							var img = document.createElement("img");
							img.classList.add("obj");
							img.file = file;
							if($target.attr('data-app-role') == 'skulist')	{
								img.height = 35;
								img.width = 35;
								}
							else	{
								img.height = 75;
								img.width = 75;
								}
							img.classList.add('newMediaFile');
			
							
							$target.children().last().before($("<li \/>").append(img)); //the last child is the 'click here'. put new image before that.
							var reader = new FileReader();
							reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
							reader.readAsDataURL(file);
							}
	
						},
					upload : function(f,e,rd)	{app.u.dump(' -> logged an upload.')}
					}).append($("<li class='dropzone'>Click or drop file here to add image</li>").on('click',function(){
						app.ext.admin_prodEdit.u.handleAddImageToList($(this).parent());
						}));
	
				r.on('mouseenter','img',function(e){
					var $target = $(e.target).closest('li');
					
					$target.on('mouseleave',function(e){
						$target.find('span').empty().remove(); //get rid of all children.
						});
					
					$target.append("<span class='imageIDRef ui-corner-tr small'>image "+($target.index() + 1)+"<\/span>");
					$("<span \/>")
						.attr('title','Disassociate image from '+pid)
						.css({
							'position':'absolute',
							'top':'3px',
							'right':'3px'
							})
						.button({icons: {primary: "ui-icon-circle-close"},text: false})
						.on('click',function(){$(this).closest('li').empty().remove();})
						.appendTo($target);
						})
					
				return r;
				},
	
	//executed when the 'add image' link is clicked, which appears in the images panel of the product editor (both in the sku and product imagery sections).
			handleAddImageToList : function($list)	{
				app.u.dump("BEGIN admin_prodEdit.u.handleAddImageToList");
	//			var $img = $list.children().last().find('img');
				var $img = $(":nth-child("+($list.children().length - 1)+")",$list).find('img');
	//if 'choose from media...' is pushed and cancelled prior to selection, there'd be an li w/ an img without a src. use that one if this is the case. otherwise, create an li w/ an img without a src.
	//or if this is the first image being added to a product.
				if($img.attr('src') || $list.children().length == 1)	{
					$img = $("<img \/>").attr({'width':($list.attr('data-app-role') == 'prodImagesContainer') ? 75 : 35,'height':($list.attr('data-app-role') == 'prodImagesContainer') ? 75 : 35});
					$("<li \/>").insertBefore($list.children().last()).append($img);
					}
				else	{}
	
				mediaLibrary($img,$("[name='throwAway']",$('#prod_images')),'Select Product Image');
				},
	
	//app.ext.admin_prodEdit.u.getPanelContents(pid,panelid)
			getPanelContents : function(pid,panelid)	{
				var r;  //what is returned. Either a jquery object of the panel contents OR false, if not all required params are passed.
				if(pid && panelid)	{
					if(panelid == 'flexedit')	{
						r = app.renderFunctions.transmogrify({'id':'panel_'+panelid,'panelid':panelid,'pid':pid},'productEditorPanelTemplate_'+panelid,app.data['adminProductDetail|'+pid]);
						$('fieldset:first',r).addClass('labelsAsBreaks alignedLabels').prepend(app.ext.admin_prodEdit.u.flexJSON2JqObj(app.data['adminConfigDetail|flexedit']['%flexedit'],app.data['adminProductDetail|'+pid]));
						
						app.ext.admin.u.handleAppEvents(r);
						}
					else if(panelid == 'reviews')	{
						r = app.renderFunctions.createTemplateInstance('productEditorPanelTemplate_reviews',{'id':'panel_'+panelid,'panelid':panelid,'pid':pid});
						app.model.addDispatchToQ({'filter':'','PID':pid,'_cmd' : 'adminProductReviewList','_tag' : {'callback':function(rd){
							$('tbody',r).anycontent({datapointer:rd.datapointer});
							$("button[data-app-event='admin_customer|adminProductReviewUpdateShow']",r).attr('data-edit-mode','dialog');
							app.u.handleAppEvents(r);
							},'datapointer' : 'adminProductReviewList|'+pid}},'mutable');
						app.model.dispatchThis('mutable')
						}
					else if(panelid == 'images')	{
						r = this.getImagesPanelContents(pid,panelid);
						}
					else if(panelid == 'navigation')	{
						r = app.renderFunctions.createTemplateInstance('productEditorPanelTemplate_navigation',{'id':'panel_'+panelid,'panelid':panelid,'pid':pid});
						app.ext.admin.u.handleAppEvents(r); //before getTree prepend because the tree code uses delegated events. The save button uses old app events tho.
						$('fieldset',r).prepend(app.ext.admin_navcats.u.getTree('chooser',{'templateID':'catTreeItemTemplate','navtree':'.','paths':app.data['adminProductNavcatList|'+pid]['@PATHS']}));
						}
					else	{
						r = app.renderFunctions.transmogrify({'id':'panel_'+panelid,'panelid':panelid,'pid':pid},'productEditorPanelTemplate_'+panelid,app.data['adminProductDetail|'+pid]);
						app.ext.admin.u.handleAppEvents(r);
						}
					}
				else	{
					r = false;
					app.u.throwGMessage("In admin_prodEdit.a.getPanelContents, no panelid specified.");
					}
				return r;
				}, //getPanelContents
	
			showProductEditor : function(path,P)	{
	//			app.u.dump("BEGIN admin_prodEdit.u.showProductEditor ["+path+"]");
	//			app.u.dump(" -> P: "); app.u.dump(P);
				
				window.savePanel = app.ext.admin_prodEdit.a.saveProductPanel;  
				//always rewrite savePanel. another 'tab' may change the function.
				//kill any calls in progress so that if setup then product tabs are clicked quickly, setup doesn't get loaded.
				app.ext.admin_prodEdit.u.handleProductListTab('deactivate'); //will clear the open results tab
				if(!$.isEmptyObject(app.ext.admin.vars.uiRequest))	{
					app.u.dump("request in progress. Aborting.");
					app.ext.admin.vars.uiRequest.abort(); //kill any exists requests. The nature of these calls is one at a time.
					}
	
	//add product page template if not already set.
				if(!$('#productEditorTemplate').length)	{
					$(app.u.jqSelector('#',P.targetID)).empty().append(
						app.renderFunctions.createTemplateInstance('productEditorTemplate')
						);
	//get and display the list of product management categories.				
					app.ext.admin.calls.adminProductManagementCategoryList.init(
						{'callback':'showMangementCats','extension':'admin_prodEdit','targetID':'manCats'},
						'mutable');
					app.model.dispatchThis('mutable');
	
	
	//add click actions to the list of tags. Once clicked, a search result for that tag will get displayed in the main edit area.
					$('.tagFilterList li','#prodLeftCol').each(function(){
						$(this).addClass('lookLikeLink').click(function(){
							app.ext.admin_prodEdit.u.prepContentArea4Results();
							var tag = $(this).text();
							$('#prodEditorResultsTbody').showLoading({'message':'Fetching items tagged as '+tag})
							app.ext.store_search.calls.appPublicProductSearch.init({"size":"50","mode":"elastic-native","filter":{"term":{"tags":tag}}},{'datapointer':'appPublicSearch|'+tag,'templateID':'productListTemplateTableResults','callback':'handleElasticResults','extension':'store_search',list:$('#prodEditorResultsTbody')});
							app.model.dispatchThis('mutable');
							})
						})
	
	//add click actions to the syndication list items. Once clicked, a search result for that tag will get displayed in the main edit area.
					$('.mktFilterList li','#prodLeftCol').each(function(){
						$(this).addClass('lookLikeLink').click(function(){
							app.ext.admin_prodEdit.u.prepContentArea4Results();
							var mktid = $(this).data('mktid')+'_on';
							$('#prodEditorResultsTbody').showLoading({'message':'Fetching items for '+$(this).text()})
							app.ext.store_search.calls.appPublicProductSearch.init({"size":"50","mode":"elastic-native","filter":{"term":{"marketplaces":mktid}}},{'datapointer':'appPublicSearch|'+mktid,'templateID':'productListTemplateTableResults','callback':'handleElasticResults','extension':'store_search',list:$('#prodEditorResultsTbody')});
							app.model.dispatchThis('mutable');
							})
						})
					}
				else	{
					//product editor is already on the dom. Right now, only one instance of the editor can be created at a time.
					}
				
				if(P.pid)	{app.ext.admin_prodEdit.a.showPanelsFor(P.pid)} //if a pid is specified, immediately show the editor for that pid.
				else if(!path || path == '/biz/product/index.cgi' || path == '/biz/product/edit.cgi?VERB=WELCOME')	{
					//do nothing. product page template has initial load content.
					}
				else	{
					P.targetID = "productTabMainContent";
					$(app.u.jqSelector('#',P.targetID)).empty().showLoading({'message':'loading...'});
					app.model.fetchAdminResource(path,P);
					}
				}, //showProductTab 
	
			handleCreateNewProduct : function(vars)	{
				var pid = vars.pid;
				delete vars.pid;
				$target = $('#createProductDialog');
				$target.showLoading({'message':'Creating product '+pid});
				app.ext.admin.calls.adminProductCreate.init(pid,vars,{'callback':function(rd){
					$target.hideLoading();
					if(app.model.responseHasErrors(rd)){
						app.u.throwMessage(rd);
						}
					else	{
						$target.empty();
						$target.append("<p>Thank you, "+pid+" has now been created. What would you like to do next?<\/p>");
						
						$("<button \/>").text('Edit '+pid).button().on('click',function(){
							app.ext.admin_prodEdit.a.showPanelsFor(pid);
							$target.dialog('close');
							}).appendTo($target);
	
						$("<button \/>").text('Add another product').button().on('click',function(){
							app.ext.admin_prodEdit.a.showCreateProductDialog();
							}).appendTo($target);
						
						$("<button \/>").text('Close Window').button().on('click',function(){
							$target.dialog('close');
							}).appendTo($target);
	
	
	
						
						}
					}});
				app.model.dispatchThis('immutable');
				}, //handleCreateNewProduct
	
	//clears existing content and creates the table for the search results. Should be used any time an elastic result set is going to be loaded into the product content area WITH a table as parent.
			prepContentArea4Results : function(){
				
				app.ext.admin_prodEdit.u.handleProductListTab('deactivate'); //if a results tab is open, this will clear it. needs to happen any time a new results set is generated.
				
				var $container = $("#productTabMainContent"),
				$table = $("<table \/>",{'id':'prodEditorResultsTable'}).addClass('fullWidth ui-widget ui-widget-content').addClass('gridTable');
				$table.append("<thead><tr><th><\/th><th>SKU<\/th><th class='hideInMinimalMode'>Name<\/th><th>Price<\/th><th class='hideInMinimalMode'>Options<\/th><th class='hideInMinimalMode'>Children<\/th><th><\/th><\/tr><\/thead>");
				$table.append($("<tbody \/>",{'id':'prodEditorResultsTbody'}));
				$container.empty().append($table);
				$table.anytable();
				}, //prepContentArea4Results
			
			handleProductKeywordSearch : function(obj)	{
				if(obj && obj.KEYWORDS)	{
					app.ext.admin_prodEdit.u.prepContentArea4Results();
					$('#prodEditorResultsTbody').showLoading({'message':'Performing search...'})
					app.ext.store_search.u.handleElasticSimpleQuery(obj.KEYWORDS,{'callback':'handleElasticResults','extension':'store_search','templateID':'productListTemplateTableResults','list':$('#prodEditorResultsTbody')});
					app.model.dispatchThis();
					}
				else	{
					//keywords are required.
					$('#globalMessaging').anymessage({"message":"In admin_prodEdit.u.handleProductKeywordSearch, KEYWORDS not present in serialized form object.","gMessage":true});
					}
				}, //handleProductKeywordSearch
			
			variationTypeIsSelectBased : function(type)	{
				var r = false;
				if(type == 'select' || type == 'radio' || type == 'attribs' || type == 'imgselect' || type == 'imggrid')	{r = true}
				return r;
				}, //variationTypeIsSelectBased
	
	//the data for a sog edit is stored in 'data' for the option in the table row.  Of course, a lot of other stuff is stored there, so this whitelists the data.
	// * 201330 -> deprecated. replaced w/ app.u.getWhitelistedObject which is more versatile
	/*		getSanitizedSogData : function(data)	{
				var r = {}; //what is returned.
				var whitelist = ['v','prompt','w','p','asm','html','img']
				for(index in whitelist)	{
					if(data[whitelist[index]])	{
						r[whitelist[index]] = data[whitelist[index]]
						}
					}
				return r;
				}, //getSanitizedSogData
	*/
	
	//the default option editor shows all the inputs.  Need to clear some out that are image or inventory specific.
	//executed from variationOptionUpdateShow and variationOptionAddShow
			handleOptionEditorInputs : function($target,data)	{
				app.u.dump("BEGIN admin_prodEdit.u.handleOptionEditorInputs. type: "+data.type); app.u.dump(data);
				$("[name='html']",$target).val(unescape($("[name='html']",$target).val()))
	//an inventory-able option does not have price or weight modifiers. price and weight are set by STID in the inventory panel.
				if(Number(data.inv))	{} else {$('.nonInvOnly',$target).removeClass('displayNone')}
				if(data.type == 'imgselect' || data.type == 'imggrid')	{
	//				app.u.dump(" -> type is image based. show image inputs.");
					$('.imgOnly',$target).removeClass('displayNone');
					}
				} //handleOptionEditorInputs
	
			}, //u

//e is for 'events'. This are used in handleAppEvents.
		e : {

// * 201334 -> new product editor.
			"productFiltersShow" : function($ele,p)	{
				var $filterMenu = $ele.closest("[data-app-role='productEditorNavtab']").find("[data-app-role='productManagerFilters']");
				$filterMenu.slideDown();
//hide filter if anything is clicked.
				setTimeout(function(){
					 $( document ).one( "click", function() {
						$filterMenu.slideUp('fast');
						});
					},100);
				},
			
			showProductEditor2 : function($ele,p)	{
				if($ele.data('pid'))	{
					app.ext.admin_prodEdit.a.showProductEditor($('#productContent'),$ele.data('pid'));
					}
				else	{
					$('#globalMessaging').anymessage({"message":"In admin_prodEdit.e.showProductEditor, no data-pid set on element with data-app-click.","gMessage":true});
					}
				},
			
			"managementCatsProdlistShow" : function($ele,p)	{
				app.ext.admin_prodEdit.u.prepContentArea4Results();
//				$('#prodEditorResultsTbody').showLoading({'message':'Performing search...'});
				var csv = app.ext.store_prodlist.u.cleanUpProductList(app.data.adminProductManagementCategoryList['%CATEGORIES'][$ele.data('management-category')]).sort();
				app.ext.store_prodlist.u.buildProductList({
					'csv': csv,
//					'parentID':'prodEditorResultsTbody',
					'loadsTemplate' : 'prodManagerProductListTemplate',
					'withVariations' : true,
					'items_per_page' : 100
					},$('#prodEditorResultsTbody'));
				},
			
			"managementCatsShow" : function($ele,p)	{
				app.u.dump(" -> BEGIN admin_prodEdit.e.managementCatsShow");
				var $menu = $ele.closest("[data-app-role='productEditorNavtab']").find("[data-app-role='productManagerManCats']:first");
				app.u.dump(" -> $menu.length: "+$menu.length);
				$menu.slideDown();
//hide menu if anything is clicked.
				setTimeout(function(){
					 $( document ).one( "click", function() {
						$menu.slideUp('fast');
						});
					},100);
				},

			productSearchExec : function($ele,p)	{
				app.ext.admin_prodEdit.u.handleProductKeywordSearch($ele.closest('form').serializeJSON());
				},

			storeVariationsShow : function($ele,p)	{
				app.ext.admin_prodEdit.a.showStoreVariationsManager($('#productContent'));
				},

			adminProductCreateShow : function($ele,p)	{
				app.ext.admin_prodEdit.a.showCreateProductDialog();
				},

// END new product editor events
			"showProductEditor" : function($btn){
				$btn.button();
//This is a separate click event so that it can be removed after the product are moved.
//this event needs to happen first because the next event removes the table.
				$btn.off('click.moveProductToTab').on('click.moveProductsToTab',function(){
					var pid = $btn.closest('[data-pid]').data('pid');
					if(pid)	{
						app.ext.admin_prodEdit.u.handleProductListTab('activate');
						}
					});

				$btn.off('click.showProductEditor').on('click.showProductEditor',function(event){
					event.preventDefault();
					var pid = $btn.closest('[data-pid]').data('pid');
					if(pid)	{
						app.ext.admin_prodEdit.a.showPanelsFor($btn.closest('[data-pid]').data('pid'));
						}
					else	{
						$('#globalMessaging').anymessage({'message':'In admin_prodEdit.e.showProductEditor, unable to ascertain product id.',gMessage:true});
						}
					});
				}, //showProductEditor
			
			"configOptions" : function($t)	{
				$t.button();
				$t.off('click.configOptions').on('click.configOptions',function(event){
					event.preventDefault();
					var pid = $(this).closest("[data-pid]").data('pid');
					if(pid)	{navigateTo('/biz/product/options2/index.cgi?product='+pid);}
					else	{app.u.throwGMessage("In admin_prodEdit.uiActions.configOptions, unable to determine pid.");}
					});
				}, //configOptions

			"enterSyndicationSpecifics" : function($t)	{
				$t.button().addClass('smallButton');
				$t.off('click.configOptions').on('click.configOptions',function(event){
					event.preventDefault();
					var pid = $(this).closest("[data-pid]").data('pid'),
					syndicateTo = $(this).data('ui-syndicateto');
					if(pid && syndicateTo)	{navigateTo("/biz/product/definition.cgi?_PRODUCT="+pid+"&amp;_DOCID="+syndicateTo+".listing",{dialog:true});}
					else	{app.u.throwGMessage("In admin_prodEdit.uiActions.configOptions, unable to determine pid ["+pid+"] or syndicateTo ["+syndicateTo+"].");}
					});
				}, //enterSyndicationSpecifics




//executed from the save button in the website navigation panel of the product editor.
			adminProductMacroNavcats : function($btn)	{
				$btn.button();
				$btn.off('click.adminProductMacroNavcats').on('click.adminProductMacroNavcats',function(event){
					event.preventDefault();
//create an object of safe id's w/ value of 1/0 based on checked/unchecked. ONLY builds cats that have changed.
var navcats = app.ext.admin_navcats.u.getPathsArrayFromTree($btn.closest("form"));
var $panel = $btn.closest(".panelContents");
var pid = $btn.closest(".productPanel").data('pid');
$panel.showLoading({'message':'Updating Website Navigation for '+pid});

var cmdObj = {
	'_cmd' : 'adminProductMacro',
	'pid' : pid,
	'@updates' : new Array(), //used for sku images
	'%attribs' : {}, //used for prod images
	'_tag' : {
		'callback' : 'showMessaging',
		'message' : "Your changes have been saved",
		jqObj : $panel
		}
	}

for(var index in navcats)	{
	cmdObj['@updates'].push("NAVCAT-"+(navcats[index] ? 'INSERT' : 'DELETE')+"?path="+index);
	}
//					app.u.dump(" -> updates: "); app.u.dump(updates);
app.model.addDispatchToQ(cmdObj,'immutable');
app.model.dispatchThis('immutable');

					
					});
				},



			"saveProdImagesPanel" : function($btn)	{
				$btn.button();
				$btn.off('click.saveProdImagesPanel').on('click.saveProdImagesPanel',function(event){
					event.preventDefault();

					var $panel = $btn.closest(".panelContents");
					
					var cmdObj = {
						'_cmd' : 'adminProductUpdate',
						'pid' : $('#panel_images').data('pid'),
						'@updates' : new Array(), //used for sku images
						'%attribs' : {}, //used for prod images
						'_tag' : {
							'callback' : 'showMessaging',
							'message' : "Your changes have been saved",
							jqObj : $panel
							}
						}
					
					
					
					//sku-specific imagery.
					$("[data-app-role='prodEditSkuImagesContainer'] tbody tr",$panel).each(function(){
						var sku = $(this).data('sku');
						var images = "";
						var $images = $('img',$(this));
					//	app.u.dump($images);
						for(i = 0; i < 3; i += 1)	{
							if($images[i])	{
								images += "&zoovy:prod_image"+(i + 1)+"="+$($images[i]).data('filename');
								}
							else	{
								images += "&zoovy:prod_image"+(i + 1)+"="; //set to blank to 'erase' anything that may have been deleted.
								}
							}
						
						cmdObj['@updates'].push("SET-SKU?SKU="+sku+images);
					//	app.u.dump(" -> sku: "+sku);
					
						});
					
					//Generic product imagery
					var imgIndex = 0;
					var $prodImageUL = $("[data-app-role='prodImagesContainer']",$panel);
					$("[data-app-role='prodImagesContainer'] img",$panel).each(function(){
						var $img = $(this);
						imgIndex++; //incremented at the beginning so that after all the loops, we have an accurate count of how many images were present.
						if($img.data('filename'))	{
							//image either an original OR added w/ media lib.
							cmdObj['%attribs']['zoovy:prod_image'+(imgIndex)] = $img.data('filename');
							}
						else	{
							//this is a 'new' image, that was dropped in.
							}
						
						})
					//if there are fewer images now than when the session began, delete values for the images that were removed/shifted.
					if(imgIndex < ($prodImageUL.children().length))	{
						var L = $prodImageUL.children().length - imgIndex;
						for(var i = 0; i <= L; i += 1)	{
							imgIndex++; //increment before to pick up after we left off.
							cmdObj['%attribs']['zoovy:prod_image'+(imgIndex)] = "";
							}
						}
					//app.u.dump(" -> cmdObj: "); app.u.dump(cmdObj);
					
					app.model.addDispatchToQ(cmdObj,'immutable');
					app.model.dispatchThis('immutable');

					});
				},

//not currently in use. planned for when html4/5, wiki and text editors are available.
			"textareaEditorMode" : function($t)	{
//				$t.addClass('ui-widget-header ui-corner-bottom');
				$("button :first",$t).addClass('ui-corner-left');
				$("button :last",$t).addClass('ui-corner-right');
				$("button",$t).each(function(){

					var $btn = $(this),
					jhtmlVars = {
						toolbar: [["bold", "italic", "underline"],["h1", "h2", "h3", "h4", "h5", "h6"],["link", "unlink"]]
						}
					
					$btn.button().removeClass('ui-corner-all'); //only the first and last buttons should have corners.
					$btn.css({'margin':'0 -2px'}).addClass('smallButton');  //reduce margins so buttons 'merge'.

					$btn.off('click.textareaEditorMode').on('click.textareaEditorMode',function(event){
						app.u.dump(" -> a click occured.");
						event.preventDefault();
						var mode = $btn.data('ui-edit-mode');
						$('#html_you_have_been_warned').hide();
						$('.ui-state-active',$t).removeClass('ui-state-active');
						if(mode == 'wiki')	{
							$("[name='"+$t.data('ui-target-name')+"']",$t.closest('fieldset')).htmlarea(jhtmlVars);
							$(this).addClass('ui-state-active');
							}
						else if(mode == 'html')	{
						$('#html_you_have_been_warned').show();
							$("[name='"+$t.data('ui-target-name')+"']",$t.closest('fieldset')).htmlarea(jhtmlVars);
							$(this).addClass('ui-state-active');
							}
						else if(mode == 'text')	{
							$("[name='"+$t.data('ui-target-name')+"']",$t.closest('fieldset')).htmlarea();
							$(this).addClass('ui-state-active');
							}
						else	{
							app.u.throwGMessage("In admin_prodEdit.buttonActions.textareaEditorMode, unsupported or blank mode ["+mode+"]");
							}
						});
					});
				}, //textareaEditorMode

			"viewProductOnWebsite" : function($t)	{
				$t.button();
				$t.off('click.configOptions').on('click.configOptions',function(event){
					event.preventDefault();
					var pid = $(this).closest("[data-pid]").data('pid');
					if(pid)	{window.open("http://"+app.vars.domain+"/product/"+pid+"/")}
					else	{app.u.throwGMessage("In admin_prodEdit.uiActions.configOptions, unable to determine pid.");}
					});
				}, //viewProductOnWebsite

			"webPageEditor" : function($t)	{
				$t.button();
				$t.off('click.webPageEditor').on('click.webPageEditor',function(event){
					event.preventDefault();
					var pid = $(this).closest("[data-pid]").data('pid');
					if(pid)	{navigateTo('/biz/product/builder/index.cgi?ACTION=INITEDIT&amp;FORMAT=PRODUCT&amp;FS=P&amp;SKU='+pid);}
					else	{app.u.throwGMessage("In admin_prodEdit.uiActions.webPageEditor, unable to determine pid.");}
					});
				}, //webPageEditor





			serializeAndAdminProductUpdate : function($t)	{
//				app.u.dump("BEGIN admin_prodEdit.uiActions.serializeAndAdminProductUpdate");
				$t.button();

				$t.off('click.serializeAndAdminProductUpdate').on('click.serializeAndAdminProductUpdate',function(event){
					event.preventDefault();
					var $btn = $(this),
					pid = $btn.closest("[data-pid]").data('pid'),
					$panel = $btn.closest("[data-panelid]")
					panelid = $panel.data('panelid'),
					formJSON = $btn.parents('form').serializeJSON({'cb':true}); //cb true handles making on = 1 and blank/unset = 0.

					if(pid && panelid && !$.isEmptyObject(formJSON))	{
						$panel.showLoading({'message':'Updating product '+pid});
//						app.ext.admin.calls.adminProductUpdate.init(pid,formJSON,{});
var macroUpdates = new Array();
$('input.handleAsSku',$panel).each(function(){
	var $input = $(this);
	macroUpdates.push("SET-SKU?SKU="+$input.attr('name').split('|')[1]+"&"+$input.attr('name').split('|')[0]+"="+$input.val());
	})

if(!$.isEmptyObject(macroUpdates))	{
	app.model.addDispatchToQ({
		'pid':pid,
		'@updates':macroUpdates,
		'_cmd': 'adminProductMacro',
		'_tag' : {}
		},'immutable');
	}

						app.model.addDispatchToQ({
							'pid':pid,
							'%attribs':formJSON,
							'_cmd': 'adminProductUpdate',
							'_tag' : {'callback':'pidFinderChangesSaved','extension':'admin'}
							},'immutable');	



						app.model.addDispatchToQ({
							'_cmd':'adminProductDetail',
							'inventory':1,
							'skus':1,
							'pid':pid,
							'_tag':	{
								'datapointer' : 'adminProductDetail|'+pid,
								'callback':function(responseData){
									$panel.hideLoading();
									if(app.model.responseHasErrors(responseData)){
										app.u.throwMessage(responseData);
										}
									else	{
										$panel.replaceWith(app.ext.admin_prodEdit.u.getPanelContents(pid,panelid));
						//								app.u.dump("$('.panelHeader',$panel)"); app.u.dump($('.panelHeader',$panel));
										$('.panelHeader','#panel_'+panelid).click(); //using $panel instead of #panel... didn't work.
										}
									}
								}
							},'immutable');
							app.model.dispatchThis('immutable');
						}
					else	{
						app.u.throwGMessage("In productEdit.u.uiActions, unable to determine pid ["+pid+"] and/or panelid ["+panelid+"] and/or formJSON is empty (see console)");
						app.u.dump(formJSON);
						}
					});
				}, //serializeAndAdminProductUpdate
			
			variationSearchByIDExec : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-search"},text: false});
				$btn.off('click.variationSearchByIDExec').on('click.variationSearchByIDExec',function(){
					app.ext.admin_prodEdit.u.prepContentArea4Results();
					$('#prodEditorResultsTbody').showLoading({'message':'Performing search...'});
					var varID = $btn.closest('tr').data('id');
					app.model.addDispatchToQ({
						"mode":"elastic-native",
						"size":250,
						"filter":{"term":{"pogs":varID}},
						"_cmd":"appPublicSearch",
						"_tag" : {
							'callback':'handleElasticResults',
							'extension':'store_search',
							'datapointer' : 'appPublicSearch|variation|'+varID,
							'templateID':'productListTemplateTableResults',
							'list':$('#prodEditorResultsTbody')
							},
						"type":"product"
						},"mutable");
					app.model.dispatchThis("mutable");
					});
				}, //variationSearchByIDExec

//well crap.  This button does two very different things.
//when in store mode, this actually executes the save.
//when in product mode, this does an 'apply', so the @variations object in memory is updated, but not saved yet.
//button is executed in the 'edit variation' screen.
			variationAdminProductMacroExec : function($btn)	{
				$btn.button();
				$btn.off('click.variationAdminProductMacroExec').on('click.variationAdminProductMacroExec',function(event){
					app.u.dump("BEGIN admin_prodEdit.e.variationAdminProductMacroExec click event.");
					event.preventDefault();
					var
						$form = $btn.closest('form'),
						variationData = $btn.closest('.variationEditorContainer').data(),
						sfo = {}, 
						variationID = $("[name='id']",$form).val();

					if(variationData.variationmode == 'product')	{
						sfo._cmd ='adminProductPOGUpdate';
//						sfo.autoid = 1; //tells api to add id's to variations or options if none are set.
						sfo.pid = variationData.pid;
//for a product update, need to send up entire variation object, not just a given sog/pog.
						sfo['%sog'] = app.data['adminProductDetail|'+sfo.pid]['@variations'];
//if guid is present, use it.  That means this was a pog just added to the product.
						var index = (variationData.variationguid) ? app.ext.admin.u.getIndexInArrayByObjValue(sfo['%sog'],'guid',variationData.variationguid) : app.ext.admin.u.getIndexInArrayByObjValue(sfo['%sog'],'id',variationID);
						$.extend(true,sfo['%sog'][index],$form.serializeJSON({'cb':true})); //update original w/ new values but preserve any values not in the form.
						sfo['%sog'][index]['@options'] = new Array();  //clear existing. that way deleted doesn't carry over.
						}
					else	{
						sfo._cmd ='adminSOGUpdate';
						//destructive update, so merge new data over old (which preserves old/unchanged).
						sfo['%sog'] = $.extend(true,{},app.data.adminSOGComplete['%SOGS'][variationID],$form.serializeJSON({'cb':true}));
						sfo['%sog']['@options'] = new Array();  //clear existing. that way deleted doesn't carry over.
						}


//data for saving options in a 'select' based option requires some manipulation to get into '@options' array.
					if(app.ext.admin_prodEdit.u.variationTypeIsSelectBased(variationData.variationtype))	{
						app.u.dump(" -> variation type ["+variationData.variationtype+"] IS select based.");
						$("[data-app-role='dataTable']:first tbody tr",$form).each(function(){
							if($(this).hasClass('rowTaggedForRemove'))	{} //don't include rows tagged for deletion.
							else	{
								var whitelist = new Array('v','prompt','w','p','asm','html','img');
								(variationData.variationmode == 'product') ? sfo['%sog'][index]['@options'].push(app.u.getWhitelistedObject($(this).data(),whitelist)) : sfo['%sog']['@options'].push(app.u.getWhitelistedObject($(this).data(),whitelist))
								}
							});						
						}
					else if(variationData.variationtype == 'biglist')	{
						app.u.dump(" -> variation type IS biglist.");
						var optionsArr = $("[name='biglist_contents']",$form).val().split("\n");
						var L = optionsArr.length;
						for(var i = 0; i < L; i += 1)	{
							sfo['%sog']['@options'].push({'prompt':optionsArr[i]});
							}
//						app.u.dump(sfo);
						}
					else	{}

// pog editor just applies changes in memory till master 'save' is done.
					if(variationData.variationmode == 'product')	{
						$btn.closest('.ui-dialog-content').dialog('close');
						$("[data-app-role='saveButton']",'#productTabMainContent').addClass('ui-state-highlight');
						}
					else	{
						$form.showLoading({"message":"Saving Changes To Variations"});
						sfo._tag = {
							callback : function(rd){
								$form.hideLoading();
								if(app.model.responseHasErrors(rd)){
									$('#globalMessaging').anymessage({'message':rd});
									}
								else	{
									$('#productTabMainContent').empty().append(app.ext.admin_prodEdit.a.getVariationEditor('store',app.data.adminSOGComplete['%SOGS'][variationID])).anymessage(app.u.successMsgObject('Your changes have been saved'));
									}
								}
							}

						app.model.addDispatchToQ(sfo,'immutable');
						app.model.addDispatchToQ({'_cmd':'adminSOGComplete','_tag':{'datapointer':'adminSOGComplete'}},'immutable');
						app.model.dispatchThis('immutable');
						}
					});
				}, //variationAdminProductMacroExec

			variationSettingsToggle : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-circle-triangle-w"},text: false});
				var type = $btn.closest('.variationEditorContainer').data('variationtype');
				if(app.ext.admin_prodEdit.u.variationTypeIsSelectBased(type))	{$btn.show()}
				$btn.off('click.variationSettingsToggle').on('click.variationSettingsToggle',function(){
					var $td = $btn.closest('table').find("[data-app-role='variationSettingsContainer']");
					if($td.is(':visible'))	{
						$td.hide();
						$btn.button('option','icons',{primary: "ui-icon-circle-triangle-e"})
						}
					else	{
						$td.show();
						$btn.button('option','icons',{primary: "ui-icon-circle-triangle-w"})
						}
					});
				}, //variationSettingsToggle

			variationAddToProduct : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-circle-arrow-w"},text: true});
				$btn.off('click.variationAddToProduct').on('click.variationAddToProduct',function(){

					var pid = $btn.closest("[data-app-role='productVariationManager']").data('pid');
					if(pid)	{
						app.u.dump(" -> pid: "+pid);
						if(app.data['adminProductDetail|'+pid] && app.data['adminProductDetail|'+pid]['@variations'])	{

							$("[data-app-role='saveButton']",'#productTabMainContent').addClass('ui-state-highlight');
							$btn.closest('tr').find("button").button('disable'); //Disable the 'add' button so sog isn't added twice.
							var variationID = $btn.closest('tr').data('id');
							app.data['adminProductDetail|'+pid]['@variations'].push($.extend(true,{'sog':variationID+'-'+app.data.adminSOGComplete['@SOGS'][variationID]},app.data.adminSOGComplete['%SOGS'][variationID])); //add to variation object in memory.
							
							var $tbody = $("<tbody \/>").anycontent({
								'templateID':'productVariationManagerProductRowTemplate',
								'data':app.data.adminSOGComplete['%SOGS'][$btn.closest('tr').data('id')],
								'dataAttribs':app.data.adminSOGComplete['%SOGS'][$btn.closest('tr').data('id')]
								})
							app.u.handleAppEvents($tbody,{'pid':pid});
							$tbody.children().attr({'data-isnew':'true','data-issog':'true'}).appendTo($btn.closest("[data-app-role='productVariationManagerContainer']").find("[data-app-role='productVariationManagerProductTbody']"));
							}
						else	{
							$('#globalMessaging').anymessage({"message":"In admin_prodEdit.e.variationAddToProduct, product or product variation object not in memory.","gMessage":true});
							}
						}
					else	{
						$('#globalMessaging').anymessage({"message":"In admin_prodEdit.e.variationAddToProduct, unable to resolve PID.","gMessage":true});
						}

					});
				}, //variationAddToProduct

			adminSOGDeleteConfirm : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-trash"},text: false});
				$btn.off('click.adminSOGDeleteConfirm').on('click.adminSOGDeleteConfirm',function(event){
					event.preventDefault();
					var 
						$tr = $btn.closest('tr'),
						data = $tr.data();

					var $D = app.ext.admin.i.dialogConfirmRemove({
						'title' : 'Please confirm removal of variation '+data.id,
						'removeFunction':function(vars,$D){
							$D.parent().showLoading({"message":"Deleting Variation"});
							app.model.addDispatchToQ({'_cmd':'adminSOGDelete','id':data.id,'_tag':{'callback':function(rd){
								$D.parent().hideLoading();
								if(app.model.responseHasErrors(rd)){
									$('#globalMessaging').anymessage({'message':rd});
									}
								else	{
									$D.dialog('close');
									$('#globalMessaging').anymessage(app.u.successMsgObject('The variation has been removed.'));
									$tr.empty().remove(); //removes row for list.
									}
								}
							}
						},'immutable');
						app.model.addDispatchToQ({'_cmd':'adminSOGComplete','_tag':{'datapointer' : 'adminSOGComplete'}},'immutable'); //update coupon list in memory.
						app.model.dispatchThis('immutable');
						}});
var $div = $("<div \/>").css({'width':200,'height':100}).appendTo($D);
$div.showLoading({"message":"Fetching # of items using this variation"});
app.model.addDispatchToQ({
	"mode":"elastic-native",
	"size":3,
	"filter":{"term":{"pogs":data.id}},
	"_cmd":"appPublicSearch",
	"_tag" : {
		'callback' : function(rd){
				$div.hideLoading();
			if(app.model.responseHasErrors(rd)){
				$div.anymessage({'message':rd});
				}
			else	{
				if(app.data[rd.datapointer] && app.data[rd.datapointer].hits && app.data[rd.datapointer].hits.total)	{
					$div.append("A search resulted in "+app.data[rd.datapointer].hits.total+" items using this variation group that will be impacted if you delete it.");
					}
				else if(app.data[rd.datapointer] && app.data[rd.datapointer]._count == 0)	{
					$div.append("A search resulted in zero items using this variation group.");
					}
				else	{
					$div.append("Unable to determine how many product may be using this variation group.");
					}
				}
			},
		'datapointer' : 'appPublicSearch|variation|'+data.id
		},
	"type":"product"
	},"mutable");
app.model.dispatchThis('mutable');

						
					})
				}, //variationRemoveConfirm

//clicked when editing an option for a 'select' type. resets and populates inputs so option can be edited.
			variationOptionUpdateShow : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-pencil"},text: false});
				$btn.off('click.variationOptionUpdateShow').on('click.variationOptionUpdateShow',function(){
					var
						$optionEditor = $btn.closest("[data-app-role='variationOptionEditorContainer']"), //used for setting context
						$saveButton = $btn.closest('form').find("[data-app-role='saveButton']");
					

					$saveButton.button('disable'); //can't save changes while option editor is open. 'prompt' input name is also in variation settings. will save over it.
					$("[data-app-role='varitionOptionAddUpdateContainer']",$optionEditor)
						.empty()
						.anycontent({'templateID':'optionEditorInputsTemplate','data':$btn.closest('tr').data()})
						.append($("<div class='buttonset alignRight' \/>")
							.append($("<button>Cancel Changes<\/button>").button().on('click',function(){
								$(this).closest("[data-app-role='varitionOptionAddUpdateContainer']").empty(); //just nuke the entire form.
								$saveButton.button('enable');
								}))
							.append("<button data-app-event='admin_config|dataTableAddExec'>Update Option<\/button>").on('click.closeEditor',function(){
								$(this).closest("[data-app-role='varitionOptionAddUpdateContainer']").empty(); //just nuke the entire form.
								$saveButton.button('enable');
								})
							);
 //below, closest.form includes 'type' and other globals necessary for what inputs are available in editor.
					app.ext.admin_prodEdit.u.handleOptionEditorInputs($optionEditor,$.extend(true,{},$btn.closest('form').serializeJSON(),$btn.closest('tr').data()));
					app.u.handleAppEvents($("[data-app-role='varitionOptionAddUpdateContainer']",$optionEditor));
					})
				}, //variationOptionUpdateShow

//executed when the 'add new option' button is clicked within a select or radio style variation group.
//The code below is very similar to variationOptionUpdateShow. Once the save is in place, see about merging these if reasonable.
			variationOptionAddShow : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-plus"},text: true});

				var varEditorData = $btn.closest(".variationEditorContainer").data();
				if(!varEditorData.ispog && varEditorData.variationid)	{
					app.u.dump("ispog was not set. varEditorData.variationid.indexOf('#'): "+varEditorData.variationid.indexOf('#'));
					if(varEditorData.variationid.indexOf('#') == 0)	{
						app.u.dump("setting ispog to true because variationid contains a #");
						varEditorData.ispog = true;
						}
					}
				//app.u.dump("BEGIN admin_prodEdit.e.variationOptionAddShow");
				//app.u.dump("varEditorData: "); app.u.dump(varEditorData);
				
				//if MODE= product and this is a SOG not a POG, then disable the button. SOGs can only use options from their original list.
				if(varEditorData.variationmode == 'product')	{
//					app.u.dump(" -> variationmode == product. varEditorData: "); app.u.dump(varEditorData);
					if(varEditorData.ispog)	{
						
						}
					else	{
						$btn.attr('title',"Can not add a new option because this is a store group.");
						$btn.button('disable');
// ** 201330 -> no point showing this button if it can't be clicked. building a new interface to allow for the SOG options to be added.
						$btn.hide();
						}
					}

				
				$btn.off('click.variationOptionAddShow').on('click.variationOptionAddShow',function(){
					var
						$optionEditor = $btn.closest("[data-app-role='variationOptionEditorContainer']"), //used for setting context
						$saveButton = $btn.closest('form').find("[data-app-role='saveButton']");

					$saveButton.button('disable');
					$("[data-app-role='varitionOptionAddUpdateContainer']",$optionEditor)
						.empty()
						.anycontent({'templateID':'optionEditorInputsTemplate','data':{'guid':app.u.guidGenerator()}}) //a guid is passed to populate that form input. required for editing a non-saved option
						.append($("<div class='buttonset alignRight' \/>")
							.append($("<button>Cancel<\/button>").button().on('click',function(){
								$(this).closest("[data-app-role='varitionOptionAddUpdateContainer']").empty(); //just nuke the entire form.
								$saveButton.button('enable');
								}))
							.append("<button data-app-event='admin_config|dataTableAddExec'>Add Option</button>").on('click.closeEditor',function(){
								$(this).closest("[data-app-role='varitionOptionAddUpdateContainer']").empty(); //just nuke the entire form.
								$saveButton.button('enable');
								})
							);
					app.ext.admin_prodEdit.u.handleOptionEditorInputs($optionEditor,$btn.closest('form').serializeJSON());
					app.u.handleAppEvents($("[data-app-role='varitionOptionAddUpdateContainer']",$optionEditor));
					})
				}, //variationOptionAddShow

			variationOptionImgLibShow : function($ele)	{
				$ele.off('click.mediaLib').on('click.mediaLib',function(event){
					event.preventDefault();
					var $context = $ele.closest('fieldset');
					mediaLibrary($("[data-app-role='variationImg']",$context),$("[name='img']",$context),'Choose Dropship Logo');
					});
				},

//clicked when editing a variation group.
			variationUpdateShow : function($btn,vars)	{
				$btn.button({icons: {primary: "ui-icon-pencil"},text: false});
				if(Number($btn.closest('tr').data('global')) == 1 && $btn.closest("[data-variationmode]").data('variationmode') == 'product'){$btn.button('disable').attr('title','Variations not editable because group is globally managed')} //globally manages sogs are not editable.
				$btn.off('click.variationUpdateShow').on('click.variationUpdateShow',function(){
					vars = vars || {};
					
//					app.u.dump("BEGIN admin_prodEdit.e.variationUpdateShow click event");
					
					if($btn.data('variationmode') == 'store')	{
						$('#productTabMainContent').empty().append(app.ext.admin_prodEdit.a.getVariationEditor('store',app.data.adminSOGComplete['%SOGS'][$btn.closest('tr').data('id')]));
						}
					else if($btn.data('variationmode') == 'product')	{
						var data, variationID = $btn.closest('tr').data('id');
						var L = app.data['adminProductDetail|'+vars.pid]['@variations'].length;
// if isnew is true, that means this is a sog or pog that was just added to the product.
// pogs do not have an ID immediately after they're added, so the guid is used to get the data from the product object in memory.
						if($btn.closest('tr').data('isnew') && $btn.closest('tr').data('ispog'))	{
							app.u.dump(" -> this is a newly added POG");
							variationID = ""; //set to blank so modal title doesn't show 'undefined'.
							data = app.data['adminProductDetail|'+vars.pid]['@variations'][app.ext.admin.u.getIndexInArrayByObjValue(app.data['adminProductDetail|'+vars.pid]['@variations'],'guid',$btn.closest('tr').data('guid'))]
							}
						else if($btn.closest('tr').data('isnew') && $btn.closest('tr').data('issog'))	{
							app.u.dump(" -> this is a sog just added to the pid");
							data = app.data.adminSOGComplete['%SOGS'][variationID]
							}
						else	{
//							app.u.dump(" -> this is an existing variation.");
//							app.u.dump(" -> index in variation object: "+app.ext.admin.u.getIndexInArrayByObjValue(app.data['adminProductDetail|'+vars.pid]['@variations'],'id',variationID));
							data = app.data['adminProductDetail|'+vars.pid]['@variations'][app.ext.admin.u.getIndexInArrayByObjValue(app.data['adminProductDetail|'+vars.pid]['@variations'],'id',variationID)]
							}

						var $D = app.ext.admin.i.dialogCreate({
							'title' : 'Edit Variation '+variationID+' for '+vars.pid,
							'showLoading' : false
							});

						$D.append(app.ext.admin_prodEdit.a.getVariationEditor('product',data,vars.pid));
//a little css tuning to make this shared content look better in a modal.
						$('hgroup',$D).hide();
						$('section.ui-widget-content',$D).css('border-width',0);

						$D.dialog('open');
						}
					else	{
						$('#globalMessaging').anymessage({"message":"In admin_prodEdit.e.variationUpdateShow, btn mode ["+$btn.data('variationmode')+"] either not set or invalid (only 'store' and 'product' are valid).","gMessage":true});
						}
					});
				}, //variationUpdateShow

			variationHandleTypeSelect : function($ele)	{
				$ele.off('click.variationHandleTypeSelect').on('click.variationHandleTypeSelect',function(){
					app.u.dump('click triggered');
					var value = $ele.val();
					var $form = $ele.closest('form');
					if(value == 'select' || value == 'radio' || value == 'cb' || value == 'imggrid' || value == 'imgselect' )	{
						$("[data-app-role='variationInventorySettings']",$form).show();
						}
					else	{
						$("[name='INV']",$form).prop('checked','');
						$("[data-app-role='variationInventorySettings']",$form).hide();
						$("[data-app-role='variationInventorySupplementals']",$form).hide(); //safe to hide this
						}
					});
				}, //variationHandleTypeSelect

			variationHandleInventoryChange : function($cb)	{
				$cb.off('change.variationHandleInventoryChange').on('change.variationHandleInventoryChange',function(){
					if($cb.is(":checked"))	{
						$("[data-app-role='variationInventorySupplementals']",$cb.closest('form')).show();
						}
					else	{
						$("[data-app-role='variationInventorySupplementals']",$cb.closest('form')).hide();
						}
					});
				}, //variationHandleInventoryChange

			variationsBackToProductExec : function($btn)	{
				$btn.button();
				if($btn.data('pid'))	{
					$btn.off('click.variationsBackToProductExec').on('click.variationsBackToProductExec',function(){
						app.ext.admin_prodEdit.a.showPanelsFor($btn.data('pid'));
						});
					}
				else	{
					$btn.button('disable').attr('title','Unable to ascertain product ID.');
					$btn.hide();
					}
				},

			variationCreateShow : function($btn)	{
				$btn.button();
				$btn.off('click.variationCreateShow').on('click.variationCreateShow',function(){
					var mode = $btn.data('variationmode');
					var $D = app.ext.admin.i.dialogCreate({
						'title' : 'Create a new '+jQuery.camelCase(mode)+' variation',
						'templateID' : 'variationsManagerCreateTemplate',
						'showLoading' : false
						});
					$D.data('variationmode',mode);
					if(mode == 'product')	{
						$D.attr('data-pid',$btn.closest('[data-pid]').data('pid'));
						}
					$D.dialog('open');
					});
				}, //variationCreateShow

			variationCreateExec : function($btn)	{
				$btn.button();
				$btn.off('click.variationsCreateExec').on('click.variationsCreateExec',function(event){
					event.preventDefault();
					var mode =
						$btn.closest('.ui-dialog-content').data('variationmode'),
						pid = $btn.closest("[data-pid]").data('pid'),
						$form = $btn.closest('form'),
						sfo = $form.serializeJSON({'cb':true});
						
					app.u.dump(" -> mode: "+mode);
					if(app.u.validateForm($form) && sfo.type)	{
						sfo.autoid = 1; //tells API to give this option a variation ID (next in sequence) and to assign id's to the options.
						if(mode == 'store')	{
							sfo.v = '2'; //sog version.
							app.model.addDispatchToQ({
								'_cmd':'adminSOGCreate',
								'%sog' : sfo,
								'_tag':	{
									'datapointer' : 'adminSOGCreate',
									callback : function(rd){
										if(app.model.responseHasErrors(rd)){
											$form.anymessage({'message':rd});
											}
										else	{
											$btn.closest('.ui-dialog-content').dialog('close');
											app.ext.admin_prodEdit.a.showStoreVariationsManager($('#productTabMainContent'));
											$('#productTabMainContent').anymessage(app.u.successMsgObject('Your variation group has been added.'))
											}
										}
									}
								},'mutable');
							app.model.addDispatchToQ({
								'_cmd':'adminSOGComplete',
								'_tag':	{
									'datapointer' : 'adminSOGComplete'
									}
								},'mutable');
							app.model.dispatchThis('mutable');
							}
						else if(mode == 'product' && pid){
							
							sfo.guid = app.u.guidGenerator();
							app.data['adminProductDetail|'+pid]['@variations'].push(sfo); //add to variation object in memory.
	
							var $tbody = $("<tbody \/>").anycontent({
								'templateID':'productVariationManagerProductRowTemplate',
								'data':sfo,
								'dataAttribs':sfo
								})
							app.u.handleAppEvents($tbody,{'pid':pid});
							$tbody.children().attr({'data-isnew':'true','data-ispog':'true'}).appendTo("[data-app-role='productVariationManagerProductTbody']",'#productTabMainContent');
							$btn.closest('.ui-dialog-content').dialog('close');
							}
						else	{
							//error. unsupported or unable to ascertain mode. or mode is product and pid could not be ascertained.
							$btn.closest('form').anymessage({"message":"In admin_prodEdit.e.variationCreateExec, either variationmode ["+mode+"] was unable to be determined or was an invalid value (only store and product are supported) or mode was set to product and PID ["+pid+"] was unable to be determined. ","gMessage":true});
							}



						}
					else if(!sfo.type)	{
						$form.anymessage({'message':'Please select a type'});
						}
					else	{} //validateForm handles error display.

					});
				}, //variationCreateExec
//this is the action on the save button in the product variation manager (product > edit > variations) which is what allows a merchant to order/add/remove options.

			productVariationsUpdateExec : function($btn)	{
				$btn.button();
				$btn.off('click.productVariationsUpdateExec').on('click.productVariationsUpdateExec',function(){

					var cmdObj = {
						'_cmd' : 'adminProductOptionsUpdate',
						'_tag' : {
							'callback' : function(rd){
								$container.hideLoading()
								if(app.model.responseHasErrors(rd)){
									$container.anymessage({'message':rd});
									}
								else	{
									app.ext.admin_prodEdit.a.showProductVariationManager($('#productTabMainContent'),cmdObj.pid);
									}
								}
							},
						'@pogs' : new Array()
						};
						
					var $container = $btn.closest("[data-app-role='productVariationManagerContainer']");
					cmdObj.pid = $btn.closest("[data-pid]").data('pid');
					var variations = app.data['adminProductDetail|'+cmdObj.pid]['@variations']; //shortcut.
// ### this is probably in the wrong spot. It should be moved over
for(index in variations)	{
	variations[index].autoid = 1; //tells the API to add id's to variations and/or options that don't have them.
	}

					$container.showLoading({"message":"Saving Product Variations Changes."});

					$container.find("[data-app-role='productVariationManagerProductTbody'] tr").each(function(){
						var $tr = $(this);
						if($tr.hasClass('rowTaggedForRemove'))	{} //row tagged for delete. do nothing.
						else	{
							
//Get the variation object out of the product object in memory.
//At this point, all the data has been shoved into %variations on the product. The only trick here is using a guid, if set (for new pogs which have no ID yet)
							
							cmdObj['@pogs'].push(variations[($tr.data('guid')) ? app.ext.admin.u.getIndexInArrayByObjValue(variations,'guid',$tr.data('guid')) : app.ext.admin.u.getIndexInArrayByObjValue(variations,'id',$tr.data('id'))]);
							
//							cmdObj['%sog'].push();
							}
						});
					
					app.model.addDispatchToQ(cmdObj,'immutable');
					app.model.dispatchThis('immutable');
					
					});
				},

//a button for toggling was added for two reasons: people may not like/have drag and drop and if no options were enabled, hard to get placement exactly right.
			variationsOptionToggle : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-arrowthick-1-w"},text: false});
				$btn.off('click.productVariationsManagerShow').on('click.productVariationsManagerShow',function(event){
					event.preventDefault();
					app.u.dump("Click! $btn.closest([data-app-role='variationsOptionsTbody']).length: "+$btn.closest("[data-app-role='variationsOptionsTbody']").length);
					
					var $tr = $btn.closest('tr');
					var $editor = $btn.closest("[data-app-role='variationOptionEditorContainer']"); //used for context.
					if($btn.closest("[data-app-role='variationsOptionsTbody']").length)	{
						$btn.button({icons: {primary: "ui-icon-arrowthick-1-w"},text: false});
						$("[data-app-role='storeVariationsOptionsTbody']",$editor).append($tr);
						}
					else	{
						$btn.button({icons: {primary: "ui-icon-arrowthick-1-e"},text: false});
						$("[data-app-role='variationsOptionsTbody']",$editor).append($tr);
						}
					});
				},

			productVariationsManagerShow : function($btn)	{
				$btn.button();
				$btn.off('click.productVariationsManagerShow').on('click.productVariationsManagerShow',function(event){
					event.preventDefault();
					var pid = $(this).closest("[data-pid]").data('pid');
					app.ext.admin_prodEdit.a.showProductVariationManager($('#productTabMainContent'),pid);
					});
				} //productVariationsManagerShow
			}
		
		} //r object.
	return r;
	}