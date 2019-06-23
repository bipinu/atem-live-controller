
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/App.svelte generated by Svelte v3.5.1 */

    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.channel = list[i];
    	return child_ctx;
    }

    // (599:4) {#each switchers[0].visibleChannels as channel}
    function create_each_block(ctx) {
    	var div, p, t_value = ctx.channel.label, t, dispose;

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file, 602, 48, 15406);
    			div.className = "button";
    			toggle_class(div, "red", ctx.isProgramChannel(ctx.channel));
    			toggle_class(div, "green", ctx.isPreviewChannel(ctx.channel));
    			add_location(div, file, 599, 6, 15238);
    			dispose = listen(div, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(p, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.switchers) && t_value !== (t_value = ctx.channel.label)) {
    				set_data(t, t_value);
    			}

    			if ((changed.isProgramChannel || changed.switchers)) {
    				toggle_class(div, "red", ctx.isProgramChannel(ctx.channel));
    			}

    			if ((changed.isPreviewChannel || changed.switchers)) {
    				toggle_class(div, "green", ctx.isPreviewChannel(ctx.channel));
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (633:6) {#if switchers[0].topology.numberOfStingers > 0}
    function create_if_block_1(ctx) {
    	var div, p, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "STING";
    			add_location(p, file, 635, 49, 16923);
    			div.className = "button";
    			toggle_class(div, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==3);
    			add_location(div, file, 633, 6, 16784);
    			dispose = listen(div, "click", ctx.click_handler_7);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    		},

    		p: function update(changed, ctx) {
    			if (changed.switchers) {
    				toggle_class(div, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==3);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (638:6) {#if switchers[0].topology.numberOfDVEs > 0}
    function create_if_block(ctx) {
    	var div, p, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "DVE";
    			add_location(p, file, 640, 49, 17150);
    			div.className = "button";
    			toggle_class(div, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==4);
    			add_location(div, file, 638, 6, 17011);
    			dispose = listen(div, "click", ctx.click_handler_8);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    		},

    		p: function update(changed, ctx) {
    			if (changed.switchers) {
    				toggle_class(div, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==4);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	var header, h1, t0_value = ctx.switchers[0]._pin, t0, t1, div27, div1, section0, h20, t3, div0, t4, div14, section1, h21, t6, div6, div2, t7, div3, p0, t8, br0, t9, t10, br1, t11, div4, p1, t13, div5, p2, t15, section2, h22, t17, div13, div7, p3, t19, div8, p4, t21, div9, p5, t23, t24, t25, div10, p6, t26, br2, t27, t28, div11, p7, t30, div12, p8, t32, input, t33, div26, section3, h23, t35, div23, div18, div15, p9, t37, div16, p10, t38, br3, t39, t40, div17, p11, t42, div22, div19, p12, t44, div20, p13, t45, br4, t46, t47, div21, p14, t49, section4, h24, t51, div25, div24, p15, dispose;

    	var each_value = ctx.switchers[0].visibleChannels;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	var if_block0 = (ctx.switchers[0].topology.numberOfStingers > 0) && create_if_block_1(ctx);

    	var if_block1 = (ctx.switchers[0].topology.numberOfDVEs > 0) && create_if_block(ctx);

    	return {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div27 = element("div");
    			div1 = element("div");
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Program & Preview";
    			t3 = space();
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div14 = element("div");
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Next Transition";
    			t6 = space();
    			div6 = element("div");
    			div2 = element("div");
    			t7 = space();
    			div3 = element("div");
    			p0 = element("p");
    			t8 = text("ON");
    			br0 = element("br");
    			t9 = text("AIR");
    			t10 = space();
    			br1 = element("br");
    			t11 = space();
    			div4 = element("div");
    			p1 = element("p");
    			p1.textContent = "BKGD";
    			t13 = space();
    			div5 = element("div");
    			p2 = element("p");
    			p2.textContent = "Key 1";
    			t15 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Transition style";
    			t17 = space();
    			div13 = element("div");
    			div7 = element("div");
    			p3 = element("p");
    			p3.textContent = "MIX";
    			t19 = space();
    			div8 = element("div");
    			p4 = element("p");
    			p4.textContent = "DIP";
    			t21 = space();
    			div9 = element("div");
    			p5 = element("p");
    			p5.textContent = "WIPE";
    			t23 = space();
    			if (if_block0) if_block0.c();
    			t24 = space();
    			if (if_block1) if_block1.c();
    			t25 = space();
    			div10 = element("div");
    			p6 = element("p");
    			t26 = text("PREV");
    			br2 = element("br");
    			t27 = text("TRAN");
    			t28 = space();
    			div11 = element("div");
    			p7 = element("p");
    			p7.textContent = "CUT";
    			t30 = space();
    			div12 = element("div");
    			p8 = element("p");
    			p8.textContent = "AUTO";
    			t32 = space();
    			input = element("input");
    			t33 = space();
    			div26 = element("div");
    			section3 = element("section");
    			h23 = element("h2");
    			h23.textContent = "Downstream Key";
    			t35 = space();
    			div23 = element("div");
    			div18 = element("div");
    			div15 = element("div");
    			p9 = element("p");
    			p9.textContent = "TIE";
    			t37 = space();
    			div16 = element("div");
    			p10 = element("p");
    			t38 = text("ON");
    			br3 = element("br");
    			t39 = text("AIR");
    			t40 = space();
    			div17 = element("div");
    			p11 = element("p");
    			p11.textContent = "AUTO";
    			t42 = space();
    			div22 = element("div");
    			div19 = element("div");
    			p12 = element("p");
    			p12.textContent = "TIE";
    			t44 = space();
    			div20 = element("div");
    			p13 = element("p");
    			t45 = text("ON");
    			br4 = element("br");
    			t46 = text("AIR");
    			t47 = space();
    			div21 = element("div");
    			p14 = element("p");
    			p14.textContent = "AUTO";
    			t49 = space();
    			section4 = element("section");
    			h24 = element("h2");
    			h24.textContent = "Fade to Black";
    			t51 = space();
    			div25 = element("div");
    			div24 = element("div");
    			p15 = element("p");
    			p15.textContent = "FTB";
    			add_location(h1, file, 589, 2, 14999);
    			header.className = "row";
    			add_location(header, file, 588, 0, 14976);
    			h20.className = "section";
    			add_location(h20, file, 596, 4, 15114);
    			div0.className = "well";
    			add_location(div0, file, 597, 4, 15161);
    			section0.className = "channels";
    			add_location(section0, file, 595, 2, 15083);
    			div1.className = "col-lg-7";
    			add_location(div1, file, 594, 0, 15058);
    			h21.className = "section";
    			add_location(h21, file, 610, 4, 15542);
    			div2.className = "button-spacer";
    			add_location(div2, file, 612, 6, 15612);
    			add_location(br0, file, 613, 128, 15774);
    			add_location(p0, file, 613, 123, 15769);
    			div3.className = "button";
    			toggle_class(div3, "red", ctx.switchers[0].video.ME[0].upstreamKeyState[0]);
    			add_location(div3, file, 613, 6, 15652);
    			add_location(br1, file, 614, 6, 15798);
    			add_location(p1, file, 615, 145, 15948);
    			div4.className = "button";
    			toggle_class(div4, "yellow", ctx.switchers[0].video.ME[0].upstreamKeyNextBackgroundState);
    			add_location(div4, file, 615, 6, 15809);
    			add_location(p2, file, 616, 134, 16100);
    			div5.className = "button";
    			toggle_class(div5, "yellow", ctx.switchers[0].video.ME[0].upstreamKeyNextState[0]);
    			add_location(div5, file, 616, 6, 15972);
    			div6.className = "well";
    			add_location(div6, file, 611, 4, 15587);
    			section1.className = "next-transition";
    			add_location(section1, file, 609, 2, 15504);
    			h22.className = "section";
    			add_location(h22, file, 621, 4, 16179);
    			add_location(p3, file, 625, 48, 16387);
    			div7.className = "button";
    			toggle_class(div7, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==0);
    			add_location(div7, file, 623, 6, 16250);
    			add_location(p4, file, 628, 46, 16543);
    			div8.className = "button";
    			toggle_class(div8, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==1);
    			add_location(div8, file, 626, 6, 16410);
    			add_location(p5, file, 631, 49, 16705);
    			div9.className = "button";
    			toggle_class(div9, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==2);
    			add_location(div9, file, 629, 6, 16566);
    			add_location(br2, file, 643, 53, 17258);
    			add_location(p6, file, 643, 46, 17251);
    			div10.className = "button";
    			add_location(div10, file, 642, 6, 17185);
    			add_location(p7, file, 645, 36, 17339);
    			div11.className = "button";
    			add_location(div11, file, 644, 6, 17283);
    			add_location(p8, file, 648, 37, 17491);
    			div12.className = "button";
    			toggle_class(div12, "red", ctx.switchers[0].video.ME[0].transitionPosition != 0);
    			add_location(div12, file, 646, 6, 17362);
    			input.className = "slider";
    			attr(input, "type", "range");
    			input.min = "0";
    			input.max = "100";
    			add_location(input, file, 649, 6, 17515);
    			div13.className = "well";
    			add_location(div13, file, 622, 4, 16225);
    			section2.className = "transition";
    			add_location(section2, file, 620, 2, 16146);
    			div14.className = "col-lg-3";
    			add_location(div14, file, 608, 0, 15479);
    			h23.className = "section";
    			add_location(h23, file, 658, 4, 17797);
    			add_location(p9, file, 661, 122, 18016);
    			div15.className = "button";
    			toggle_class(div15, "yellow", ctx.switchers[0].video.downstreamKeyTie[0]);
    			add_location(div15, file, 661, 8, 17902);
    			add_location(br3, file, 662, 122, 18155);
    			add_location(p10, file, 662, 117, 18150);
    			div16.className = "button";
    			toggle_class(div16, "red", ctx.switchers[0].video.downstreamKeyOn[0]);
    			add_location(div16, file, 662, 8, 18041);
    			add_location(p11, file, 663, 81, 18254);
    			div17.className = "button";
    			toggle_class(div17, "red", false);
    			add_location(div17, file, 663, 8, 18181);
    			div18.className = "button-column";
    			add_location(div18, file, 660, 6, 17866);
    			add_location(p12, file, 666, 122, 18441);
    			div19.className = "button";
    			toggle_class(div19, "yellow", ctx.switchers[0].video.downstreamKeyTie[1]);
    			add_location(div19, file, 666, 8, 18327);
    			add_location(br4, file, 667, 122, 18580);
    			add_location(p13, file, 667, 117, 18575);
    			div20.className = "button";
    			toggle_class(div20, "red", ctx.switchers[0].video.downstreamKeyOn[1]);
    			add_location(div20, file, 667, 8, 18466);
    			add_location(p14, file, 668, 81, 18679);
    			div21.className = "button";
    			toggle_class(div21, "red", false);
    			add_location(div21, file, 668, 8, 18606);
    			div22.className = "button-column";
    			add_location(div22, file, 665, 6, 18291);
    			div23.className = "well";
    			add_location(div23, file, 659, 4, 17841);
    			section3.className = "downstream-key";
    			add_location(section3, file, 657, 2, 17760);
    			h24.className = "section";
    			add_location(h24, file, 674, 4, 18773);
    			add_location(p15, file, 676, 98, 18933);
    			div24.className = "button";
    			toggle_class(div24, "red", ctx.switchers[0].video.ME[0].fadeToBlack);
    			add_location(div24, file, 676, 6, 18841);
    			div25.className = "well";
    			add_location(div25, file, 675, 4, 18816);
    			section4.className = "fade-to-black";
    			add_location(section4, file, 673, 2, 18737);
    			div26.className = "col-lg-2";
    			add_location(div26, file, 656, 0, 17735);
    			div27.className = "row";
    			add_location(div27, file, 592, 0, 15039);

    			dispose = [
    				listen(div3, "click", ctx.click_handler_1),
    				listen(div4, "click", ctx.click_handler_2),
    				listen(div5, "click", ctx.click_handler_3),
    				listen(div7, "click", ctx.click_handler_4),
    				listen(div8, "click", ctx.click_handler_5),
    				listen(div9, "click", ctx.click_handler_6),
    				listen(div10, "click", ctx.changeTransitionPreview),
    				listen(div11, "click", ctx.cutTransition),
    				listen(div12, "click", ctx.autoTransition),
    				listen(input, "change", ctx.input_change_input_handler),
    				listen(input, "input", ctx.input_change_input_handler),
    				listen(input, "input", ctx.input_handler),
    				listen(div15, "click", ctx.click_handler_9),
    				listen(div16, "click", ctx.click_handler_10),
    				listen(div17, "click", ctx.click_handler_11),
    				listen(div19, "click", ctx.click_handler_12),
    				listen(div20, "click", ctx.click_handler_13),
    				listen(div21, "click", ctx.click_handler_14),
    				listen(div24, "click", ctx.fadeToBlack)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, header, anchor);
    			append(header, h1);
    			append(h1, t0);
    			insert(target, t1, anchor);
    			insert(target, div27, anchor);
    			append(div27, div1);
    			append(div1, section0);
    			append(section0, h20);
    			append(section0, t3);
    			append(section0, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append(div27, t4);
    			append(div27, div14);
    			append(div14, section1);
    			append(section1, h21);
    			append(section1, t6);
    			append(section1, div6);
    			append(div6, div2);
    			append(div6, t7);
    			append(div6, div3);
    			append(div3, p0);
    			append(p0, t8);
    			append(p0, br0);
    			append(p0, t9);
    			append(div6, t10);
    			append(div6, br1);
    			append(div6, t11);
    			append(div6, div4);
    			append(div4, p1);
    			append(div6, t13);
    			append(div6, div5);
    			append(div5, p2);
    			append(div14, t15);
    			append(div14, section2);
    			append(section2, h22);
    			append(section2, t17);
    			append(section2, div13);
    			append(div13, div7);
    			append(div7, p3);
    			append(div13, t19);
    			append(div13, div8);
    			append(div8, p4);
    			append(div13, t21);
    			append(div13, div9);
    			append(div9, p5);
    			append(div13, t23);
    			if (if_block0) if_block0.m(div13, null);
    			append(div13, t24);
    			if (if_block1) if_block1.m(div13, null);
    			append(div13, t25);
    			append(div13, div10);
    			append(div10, p6);
    			append(p6, t26);
    			append(p6, br2);
    			append(p6, t27);
    			append(div13, t28);
    			append(div13, div11);
    			append(div11, p7);
    			append(div13, t30);
    			append(div13, div12);
    			append(div12, p8);
    			append(div13, t32);
    			append(div13, input);

    			input.value = ctx.switchers[0].video.ME[0].transitionPosition;

    			append(div27, t33);
    			append(div27, div26);
    			append(div26, section3);
    			append(section3, h23);
    			append(section3, t35);
    			append(section3, div23);
    			append(div23, div18);
    			append(div18, div15);
    			append(div15, p9);
    			append(div18, t37);
    			append(div18, div16);
    			append(div16, p10);
    			append(p10, t38);
    			append(p10, br3);
    			append(p10, t39);
    			append(div18, t40);
    			append(div18, div17);
    			append(div17, p11);
    			append(div23, t42);
    			append(div23, div22);
    			append(div22, div19);
    			append(div19, p12);
    			append(div22, t44);
    			append(div22, div20);
    			append(div20, p13);
    			append(p13, t45);
    			append(p13, br4);
    			append(p13, t46);
    			append(div22, t47);
    			append(div22, div21);
    			append(div21, p14);
    			append(div26, t49);
    			append(div26, section4);
    			append(section4, h24);
    			append(section4, t51);
    			append(section4, div25);
    			append(div25, div24);
    			append(div24, p15);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.switchers) && t0_value !== (t0_value = ctx.switchers[0]._pin)) {
    				set_data(t0, t0_value);
    			}

    			if (changed.isProgramChannel || changed.switchers || changed.isPreviewChannel) {
    				each_value = ctx.switchers[0].visibleChannels;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.switchers) {
    				toggle_class(div3, "red", ctx.switchers[0].video.ME[0].upstreamKeyState[0]);
    				toggle_class(div4, "yellow", ctx.switchers[0].video.ME[0].upstreamKeyNextBackgroundState);
    				toggle_class(div5, "yellow", ctx.switchers[0].video.ME[0].upstreamKeyNextState[0]);
    				toggle_class(div7, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==0);
    				toggle_class(div8, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==1);
    				toggle_class(div9, "yellow", ctx.switchers[0].video.ME[0].transitionStyle==2);
    			}

    			if (ctx.switchers[0].topology.numberOfStingers > 0) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div13, t24);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.switchers[0].topology.numberOfDVEs > 0) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div13, t25);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (changed.switchers) {
    				toggle_class(div12, "red", ctx.switchers[0].video.ME[0].transitionPosition != 0);
    			}

    			if (changed.switchers) input.value = ctx.switchers[0].video.ME[0].transitionPosition;

    			if (changed.switchers) {
    				toggle_class(div15, "yellow", ctx.switchers[0].video.downstreamKeyTie[0]);
    				toggle_class(div16, "red", ctx.switchers[0].video.downstreamKeyOn[0]);
    				toggle_class(div19, "yellow", ctx.switchers[0].video.downstreamKeyTie[1]);
    				toggle_class(div20, "red", ctx.switchers[0].video.downstreamKeyOn[1]);
    				toggle_class(div24, "red", ctx.switchers[0].video.ME[0].fadeToBlack);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(header);
    				detach(t1);
    				detach(div27);
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};
    }

    function updateVisibleChannels(atem) {
    	atem.visibleChannels = [];
    	for (var id in atem.channels) {
    		const channel = atem.channels[id];
    		channel.id = id;
    		channel.device = atem.device;
    		channel.input = id;
    	}
    	// standard inputs
    	for (var id=1; id<10; id++) {
    		if (atem.channels[id]) {
    			atem.visibleChannels.push(atem.channels[id]);
    		} else {
    			break;
    		}
    	}
    	// Black
    	if (atem.channels[0]) {
    		atem.visibleChannels.push(atem.channels[0]);
    	}
    	// Colors
    	for (var id=2001; id<3000; id++) {
    		if (atem.channels[id]) {
    			atem.visibleChannels.push(atem.channels[id]);
    		} else {
    			break;
    		}
    	}
    	// Color Bars
    	if (atem.channels[1000]) {
    		atem.visibleChannels.push(atem.channels[1000]);
    	}
    	// Media Players
    	for (var id=3010; id<4000; id+=10) {
    		if (atem.channels[id]) {
    			atem.visibleChannels.push(atem.channels[id]);
    		} else {
    			break;
    		}
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let switchers = [
        {
          "topology": {
            "numberOfMEs": 1,
            "numberOfSources": 18,
            "numberOfColorGenerators": 2,
            "numberOfAUXs": 0,
            "numberOfDownstreamKeys": 0,
            "numberOfStingers": 2,
            "numberOfDVEs": 0,
            "numberOfSuperSources": 4
          },
          "tallys": [2, 0, 0, 0, 0, 0],
          "channels": {
            "0": {
              "name": "Black",
              "label": "Blk",
              "id": "0",
              "device": 0,
              "input": "0"
            },
            "1": {
              "name": "Cam 1",
              "label": "CAM1",
              "id": "1",
              "device": 0,
              "input": "1"
            },
            "2": {
              "name": "Cam 2",
              "label": "CAM2",
              "id": "2",
              "device": 0,
              "input": "2"
            },
            "3": {
              "name": "Cam 3",
              "label": "CAM3",
              "id": "3",
              "device": 0,
              "input": "3"
            },
            "4": {
              "name": "Cam 4",
              "label": "CAM4",
              "id": "4",
              "device": 0,
              "input": "4"
            },
            "5": {
              "name": "Cam 5",
              "label": "CAM5",
              "id": "5",
              "device": 0,
              "input": "5"
            },
            "6": {
              "name": "Cam 6",
              "label": "CAM6",
              "id": "6",
              "device": 0,
              "input": "6"
            },
            "1000": {
              "name": "Color Bars",
              "label": "Bars",
              "id": "1000",
              "device": 0,
              "input": "1000"
            },
            "2001": {
              "name": "Color 1",
              "label": "Col1",
              "id": "2001",
              "device": 0,
              "input": "2001"
            },
            "2002": {
              "name": "Color 2",
              "label": "Col2",
              "id": "2002",
              "device": 0,
              "input": "2002"
            },
            "3010": {
              "name": "Media Player 1",
              "label": "MP1",
              "id": "3010",
              "device": 0,
              "input": "3010"
            },
            "3011": {
              "name": "Media 1 Key",
              "label": "MP1K",
              "id": "3011",
              "device": 0,
              "input": "3011"
            },
            "3020": {
              "name": "Media Player 2",
              "label": "MP2",
              "id": "3020",
              "device": 0,
              "input": "3020"
            },
            "3021": {
              "name": "Media Player 2 Key",
              "label": "MP2K",
              "id": "3021",
              "device": 0,
              "input": "3021"
            },
            "7001": {
              "name": "Clean Feed 1",
              "label": "Cfd1",
              "id": "7001",
              "device": 0,
              "input": "7001"
            },
            "7002": {
              "name": "Clean Feed 2",
              "label": "Cfd2",
              "id": "7002",
              "device": 0,
              "input": "7002"
            },
            "10010": {
              "name": "Program",
              "label": "Pgm",
              "id": "10010",
              "device": 0,
              "input": "10010"
            },
            "10011": {
              "name": "Preview",
              "label": "Pvw",
              "id": "10011",
              "device": 0,
              "input": "10011"
            }
          },
          "video": {
            "ME": [
              {
                "upstreamKeyState": [false],
                "upstreamKeyNextState": [false],
                "numberOfKeyers": 1,
                "programInput": 3010,
                "previewInput": 1,
                "transitionStyle": 0,
                "upstreamKeyNextBackground": true,
                "transitionPreview": false,
                "transitionPosition": 0,
                "transitionFrameCount": 25,
                "fadeToBlack": false
              }
            ],
            "downstreamKeyOn": [false, false],
            "downstreamKeyTie": [false, false],
            "auxs": {}
          },
          "audio": {
            "hasMonitor": false,
            "numberOfChannels": 0,
            "channels": {
              "1": {
                "on": false,
                "afv": false,
                "gain": 0.5011853596610636,
                "rawGain": 32768,
                "rawPan": 0
              },
              "2": {
                "on": false,
                "afv": false,
                "gain": 0.5011853596610636,
                "rawGain": 32768,
                "rawPan": 0
              },
              "3": {
                "on": false,
                "afv": false,
                "gain": 0.5011853596610636,
                "rawGain": 32768,
                "rawPan": 0
              },
              "4": {
                "on": false,
                "afv": false,
                "gain": 0.5011853596610636,
                "rawGain": 32768,
                "rawPan": 0
              },
              "5": {
                "on": false,
                "afv": false,
                "gain": 0.5011853596610636,
                "rawGain": 32768,
                "rawPan": 0
              },
              "6": {
                "on": false,
                "afv": false,
                "gain": 0.5011853596610636,
                "rawGain": 32768,
                "rawPan": 0
              },
              "1101": {
                "on": true,
                "afv": false,
                "gain": 0.5011853596610636,
                "rawGain": 32768,
                "rawPan": 0
              }
            },
            "master": {
              "afv": false,
              "gain": 0.5011853596610636,
              "rawGain": 32768
            }
          },
          "device": 0,
          "_ver0": 2,
          "_ver1": 27,
          "_pin": "ATEM Television Studio",
          "model": 1,
          "visibleChannels": [
            {
              "name": "Titulky",
              "label": "TIT",
              "id": "1",
              "device": 0,
              "input": "1"
            },
            {
              "name": "Video PC",
              "label": "VID",
              "id": "2",
              "device": 0,
              "input": "2"
            },
            {
              "name": "Cam 3",
              "label": "CAM3",
              "id": "3",
              "device": 0,
              "input": "3"
            },
            {
              "name": "Cam 4",
              "label": "CAM4",
              "id": "4",
              "device": 0,
              "input": "4"
            },
            {
              "name": "Cam 5",
              "label": "CAM5",
              "id": "5",
              "device": 0,
              "input": "5"
            },
            {
              "name": "Cam 6",
              "label": "CAM6",
              "id": "6",
              "device": 0,
              "input": "6"
            },
            {
              "name": "Black",
              "label": "Blk",
              "id": "0",
              "device": 0,
              "input": "0"
            },
            {
              "name": "Color 1",
              "label": "Col1",
              "id": "2001",
              "device": 0,
              "input": "2001"
            },
            {
              "name": "Color 2",
              "label": "Col2",
              "id": "2002",
              "device": 0,
              "input": "2002"
            },
            {
              "name": "Color Bars",
              "label": "Bars",
              "id": "1000",
              "device": 0,
              "input": "1000"
            },
            {
              "name": "Media 1 Logo",
              "label": "LOGO",
              "id": "3010",
              "device": 0,
              "input": "3010"
            },
            {
              "name": "Media Player 2",
              "label": "MP2",
              "id": "3020",
              "device": 0,
              "input": "3020"
            }
          ]
        }
      ];

    let channels = [
        { "device": 0, "input": 1 },
        { "device": 0, "input": 2 },
        { "device": 0, "input": 3 },
        { "device": 0, "input": 4 },
        { "device": 0, "input": 5 },
        { "device": 0, "input": 6 },
        { "device": 0, "input": 7 },
        { "device": 0, "input": 8 },
        { "device": 0, "input": 9 },
        { "device": 0, "input": 10 },
        { "device": 0, "input": 3010 },
        { "device": 0, "input": 3020 }
      ];

    let ws;
    let intervalID = 0;
    let socketIsOpen = false;

    function doConnect() {
    	ws = new WebSocket("ws://localhost:8080/ws");
    	ws.addEventListener('open', function(event) {
    		console.log('websocket opened');
    		socketIsOpen = true;
    		clearInterval(intervalID);
    		intervalID = 0;
    	});
    	ws.addEventListener('message', function(event) {
    		let data = JSON.parse(event.data);
    		console.log(data);
    		if (data.switchers) {
    			for (var atem of data.switchers) {
    				updateVisibleChannels(atem);
    			}
    			$$invalidate('switchers', switchers = data.switchers);
    		}
    		if (data.channels) {
    			channels = data.channels;
    		}
    		return data;
    	});
    	ws.addEventListener('error', function(evt) {
    		socketIsOpen = false;
    		if (!intervalID) {
    			intervalID = setTimeout(doConnect, 5000);
    		}
    	});
    	ws.addEventListener('close', function(event) {
    		console.log('websocket closed');
    		socketIsOpen = false;
    		if (!intervalID) {
    			intervalID = setTimeout(doConnect, 5000);
    		}
    	});
    }

    function onKeyUp(event) {
    	var key = event.key || event.keyCode;
    	if (key === ' ' || key === 32) {
            event.preventDefault();
            cutTransition();
      } else if (key === 'Enter' || key === 13) {
    		autoTransition();
    	} else if (key >= '0' && key <= '9') {
    		if (event.getModifierState('Control')) {
    			changeProgramInput(0, key);
    		} else {
    			changePreviewInput(0, key);
    		}
      }
    }

    onMount(() => {
    	doConnect();
    	document.addEventListener('keyup', onKeyUp);
    });

    function sendMessage(data) {
    	if (socketIsOpen) {
    		ws.send(JSON.stringify(data));
    	} else {
    		console.log('sendMessage failed: Websocket not connected');
    	}
    }

    function findChannel(device, input) {
    	return switchers[device].channels[input];
    }

    function findChainChannel(device, targetDevice) {
    	for (let channel of channels) {
    		if ((channel.device === device) && (channel.chainDevice === targetDevice)) { return channel; }
    	}
    }

    function getParentProgramChannel() {
    	return findChannel(0, switchers[0].video.ME[0].programInput);
    }

    function getVirtualProgramChannel() {
    	const parentProgramChannel = findChannel(0, switchers[0].video.ME[0].programInput);
    	if (parentProgramChannel.chainDevice != null) {
    		return findChannel(parentProgramChannel.chainDevice, switchers[parentProgramChannel.chainDevice].video.ME[0].programInput);
    	} else {
    		return findChannel(0, switchers[0].video.ME[0].programInput);
    	}
    }
    function getVirtualPreviewChannel() {
    	const parentProgramChannel = findChannel(0, switchers[0].video.ME[0].programInput);
    	const parentPreviewChannel = findChannel(0, switchers[0].video.ME[0].previewInput);
    	if ((parentPreviewChannel.chainDevice != null) && (parentProgramChannel.chainDevice === parentPreviewChannel.chainDevice)) {
    		return findChannel(parentPreviewChannel.chainDevice, switchers[parentPreviewChannel.chainDevice].video.ME[0].previewInput);
    	} else if (parentPreviewChannel.chainDevice != null) {
    		return findChannel(parentPreviewChannel.chainDevice, switchers[parentPreviewChannel.chainDevice].video.ME[0].programInput);
    	} else {
    		return findChannel(0, switchers[0].video.ME[0].previewInput);
    	}
    }
    function getTransitionDevice() {
    	const parentProgramChannel = findChannel(0, switchers[0].video.ME[0].programInput);
    	const parentPreviewChannel = findChannel(0, switchers[0].video.ME[0].previewInput);
    	console.log(parentProgramChannel, parentPreviewChannel);
    	if ((parentPreviewChannel.chainDevice != null) && (parentProgramChannel.chainDevice === parentPreviewChannel.chainDevice)) {
    		return parentPreviewChannel.chainDevice;
    	} else {
    		return 0;
    	}
    }
    function isProgramChannel(channel) {
    	const programChannel = getVirtualProgramChannel();
    	return (programChannel.device === channel.device) && (programChannel.input === channel.input);
    }
    function isPreviewChannel(channel) {
    	const previewChannel = getVirtualPreviewChannel();
    	return (previewChannel.device === channel.device) && (previewChannel.input === channel.input);
    }
    function changeProgramInput(device, input) {
    	sendMessage({changeProgramInput: {device, input}});
    }

    function changePreviewInput(device, input) {
    	sendMessage({changePreviewInput: {device, input}});
    }

    function changePreview(channel) {
    	const isParentDevice = channel.device === 0;
    	if (isParentDevice) {
    		return changePreviewInput(0, channel.input);
    	} else {
    		const chainChannel = findChainChannel(0, channel.device);
    		changePreviewInput(chainChannel.device, chainChannel.input);
    		if (getParentProgramChannel().chainDevice === channel.device) {
    			return changePreviewInput(channel.device, channel.input);
    		} else {
    			return changeProgramInput(channel.device, channel.input);
    		}
    	}
    }
    function autoTransition(device) {
    	sendMessage({autoTransition: {device: 0}});
    }

    function cutTransition(device) {
    	sendMessage({cutTransition: {device: 0}});
    }

    function changeTransitionPreview(device) {
      device = device || 0;
    	const status = !switchers[0].video.ME[0].transitionPreview;
    	sendMessage({changeTransitionPreview: {device, status}});
    }

    function changeTransitionPosition(percent, device = getTransitionDevice()) {
      console.assert(percent);
    	sendMessage({changeTransitionPosition: {device, position: parseInt(percent)*10000}});
    }

    function changeTransitionType(type) {
    	sendMessage({changeTransitionType: {type}});
    }

    function toggleUpstreamKeyNextBackground() {
    	const status = !switchers[0].video.ME[0].upstreamKeyNextBackground;
    	sendMessage({changeUpstreamKeyNextBackground: {device: 0, status}});
    }
    function toggleUpstreamKeyNextState(number) {
    	const status = !switchers[0].video.ME[0].upstreamKeyNextState[number];
    	sendMessage({changeUpstreamKeyNextBackground: {device: 0, number, status}});
    }
    function toggleUpstreamKeyState(number) {
    	const status = !switchers[0].video.ME[0].upstreamKeyState[number];
    	sendMessage({changeUpstreamKeyState: {device: 0, number, status}});
    }
    function toggleDownstreamKeyTie(number) {
    	const status = !switchers[0].video.downstreamKeyTie[number];
    	sendMessage({changeDownstreamKeyTie: {device: 0, number, status}});
    }
    function toggleDownstreamKeyOn(number) {
    	const status = !switchers[0].video.downstreamKeyOn[number];
    	sendMessage({changeDownstreamKeyOn: {device: 0, number, status}});
    }
    function autoDownstreamKey(number) {
    	sendMessage({autoDownstreamKey: {device: 0, number}});
    }
    function fadeToBlack() {
    	sendMessage({fadeToBlack: {device: 0}});
    }

    	function click_handler({ channel }, e) {
    		return changePreview(channel);
    	}

    	function click_handler_1(e) {
    		return toggleUpstreamKeyState(0);
    	}

    	function click_handler_2(e) {
    		return toggleUpstreamKeyNextBackground();
    	}

    	function click_handler_3(e) {
    		return toggleUpstreamKeyNextState(0);
    	}

    	function click_handler_4(e) {
    		return changeTransitionType(0);
    	}

    	function click_handler_5(e) {
    		return changeTransitionType(1);
    	}

    	function click_handler_6(e) {
    		return changeTransitionType(2);
    	}

    	function click_handler_7(e) {
    		return changeTransitionType(3);
    	}

    	function click_handler_8(e) {
    		return changeTransitionType(4);
    	}

    	function input_change_input_handler() {
    		switchers[0].video.ME[0].transitionPosition = to_number(this.value);
    		$$invalidate('switchers', switchers);
    	}

    	function input_handler(e) {
    		return changeTransitionPosition(this.value);
    	}

    	function click_handler_9(e) {
    		return toggleDownstreamKeyTie(1);
    	}

    	function click_handler_10(e) {
    		return toggleDownstreamKeyOn(1);
    	}

    	function click_handler_11(e) {
    		return autoDownstreamKey(1);
    	}

    	function click_handler_12(e) {
    		return toggleDownstreamKeyTie(2);
    	}

    	function click_handler_13(e) {
    		return toggleDownstreamKeyOn(2);
    	}

    	function click_handler_14(e) {
    		return autoDownstreamKey(2);
    	}

    	return {
    		switchers,
    		isProgramChannel,
    		isPreviewChannel,
    		changePreview,
    		autoTransition,
    		cutTransition,
    		changeTransitionPreview,
    		changeTransitionPosition,
    		changeTransitionType,
    		toggleUpstreamKeyNextBackground,
    		toggleUpstreamKeyNextState,
    		toggleUpstreamKeyState,
    		toggleDownstreamKeyTie,
    		toggleDownstreamKeyOn,
    		autoDownstreamKey,
    		fadeToBlack,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		input_change_input_handler,
    		input_handler,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
