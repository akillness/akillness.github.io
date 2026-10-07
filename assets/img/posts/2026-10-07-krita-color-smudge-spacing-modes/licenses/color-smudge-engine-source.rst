.. meta::
   :description property=og\:description:
        The Color Smudge Brush Engine manual page.

.. metadata-placeholder

   :authors: - Wolthera van Hövell tot Westerflier <griffinvalley@gmail.com>
             - Raghavendra Kamath <raghavendr.raghu@gmail.com>
             - Scott Petrovic
             - ValerieVK
             - Peter Schatz
   :license: GNU free documentation license 1.3 or later.

.. index:: Brush Engine, Color Smudge Brush Engine, Color Mixing, Smudge
.. _color_smudge_brush_engine:

=========================
Color Smudge Brush Engine
=========================

.. image:: /images/icons/colorsmudge.svg


The Color Smudge Brush is a brush engine that allows you to mix colors by smearing or dulling. A very powerful brush engine to the painter.

Options
-------


* :ref:`option_brush_tip`
* :ref:`blending_modes`
* :ref:`option_opacity_n_flow`
* :ref:`option_size`
* :ref:`option_ratio`
* :ref:`option_spacing`
* :ref:`option_paint_thickness`
* :ref:`option_mirror`
* :ref:`option_rotation`
* :ref:`option_scatter`
* :ref:`option_gradient`
* :ref:`option_airbrush`
* :ref:`option_texture`
* :ref:`option_overlay`
* :ref:`option_hue_sat_val_color_smudge`


Options Unique to the Color Smudge Brush
----------------------------------------

.. _option_color_rate:

Color Rate
~~~~~~~~~~

How much of the foreground color is added to the smudging mix. Works together with :ref:`option_smudge_length` and :ref:`option_smudge_radius`.

.. figure:: /images/brushes/colorsmudge/brushengine_color_rate_smear.svg

   A variety of color smudge strokes in the :dfn:`Smear Mode` with different opacities, smudge lengths and spacing. All are with 50% :dfn:`Color Rate`. Left-hand set being the old algorithm and the right-hand set the new algorithm. The bottom two strokes are using the :ref:`bm_color_dodge` blending mode.

.. versionadded:: 5.0
   
   The option :guilabel:`Use new smudge algorithm` greatly affects how the :dfn:`Color Rate` works. With the old algorithm, the :dfn:`Color Rate` will be affected by both smudge length and opacity, while with the new algorithm, :dfn:`Color Rate` will only interact with :dfn:`Opacity`.

   At first glance, this may seem like it reduces nuance. But instead, the new algorithm simplifies brush creation, with it being far clearer which elements interact with :dfn:`Color Rate`.

.. figure:: /images/brushes/colorsmudge/brushengine_color_rate_dulling.svg

   Same as figure above, but then in :dfn:`Dulling Mode`.

Using the new algorithm, turning off the smudge length is all that's needed to make a brush that is similar to the :ref:`pixel_brush_engine`. This is useful as a starting point for brushes that only need a little smudge.

When using the :ref:`gradient mode <brush_mode>`, the :dfn:`Color Rate` will control the colored brush tip instead of a flat color.

Blending modes are applied when the color part is composed onto the smudge part. This effectively means that color smudge brushes with a blending mode other than :ref:`bm_normal` will be greatly affected by :dfn:`Color Rate` in addition to :ref:`option_spacing` and :ref:`opacity <option_opacity_n_flow>`.

.. _option_smudge_length:

Smudge Length
~~~~~~~~~~~~~

Affects smudging and allows you to set it to Sensors. Smudging is greatly affected by :ref:`option_spacing` as well as :ref:`Opacity <option_opacity_n_flow>`. The former controls how many dabs are placed, and thus how many samples are made. This results in a smoother result for :dfn:`Smear Mode`, and a more opaque result for :dfn:`Dulling Mode`.

There are two major types:

Smearing
    Copies the area underneath the previous position of the brush onto the new position, taking opacity into account. This tends to result in a smear-effect.
    
    Great for making brushes that have a very impasto oil feel to them. It's recommended to have a low spacing for Smear, as this will result in a less grainy looking smear.
    
    .. figure:: /images/brushes/colorsmudge/brushengine_smudge_length_smear.svg

       A variety of color smudge strokes in the :dfn:`Smear Mode` with different opacities, smudge lengths and spacing. Left-hand set being the old algorithm and the right-hand set the new algorithm. The bottom two strokes are using the :ref:`bm_color_dodge` blending mode, which does not have any meaningful effect, given the :ref:`option_color_rate` is set to 0%.

Dulling
    Picks the color underneath the brush dab (using the Smudge Radius, if applicable), and first fills the whole dab with that before applying the color and the opacity. Named so because it dulls strong colors.

    Using an arithmetic blending type, Dulling is great for more smooth type of painting. It's recommended to increase the spacing on dulling brushes as much as possible without the stroke looking choppy, as it speeds up the brush without losing smudge quality. The resulting stroke can be made stronger by increasing the smudge radius or the opacity.
    
    .. figure:: /images/brushes/colorsmudge/brushengine_smudge_length_dulling.svg
    
       Same as above, but then for the :dfn:`Dulling Mode`.

Strength
    Affects how much the smudge length takes from the previous dab its sampling. This means that smudge length at 100% will never decrease, but smudge lengths under that will decrease based on :ref:`option_spacing` and :ref:`Opacity <option_opacity_n_flow>`.
Smear Alpha
    Controls whether the transparency of the smeared pixels is taken into account when painting. This can be helpful to get a more opaque effect, as if laying down thick layers of paint, without losing the smudge effect.
    
    .. figure:: /images/brushes/colorsmudge/brushengine_smudge_length_smear_alpha.png
    
       Different strokes showing how smear alpha functions.
       
       1. :dfn:`Smear Mode` with :dfn:`Smear Alpha`.
       2. :dfn:`Smear Mode` without :dfn:`Smear Alpha`.
       3. :dfn:`Dulling Mode` with :dfn:`Smear Alpha`.
       4. :dfn:`Dulling Mode` without :dfn:`Smear Alpha`.
       5. :dfn:`Dulling Mode` without :dfn:`Smear Alpha`, and :ref:`option_smudge_radius` set to 100%.
    
Use new smudge algorithm
    .. versionadded:: 5.0
    
    The new smudge algorithm was initially introduced to allow :ref:`lightness and gradient modes <brush_mode>` on the color smudge. But it allows for more: it is a little quicker, and it has a better separation between the :ref:`option_color_rate` and the :dfn:`Smudge Length`.

Common behaviors:
^^^^^^^^^^^^^^^^^

* Unchecking the smudge length function sets smudge length to 100% (not 0.00).
* Opacity: Below 50%, there is practically no smudging left: keep opacity over 50%.
 
Differences:
^^^^^^^^^^^^

* Spacing with Smearing: the lower the spacing, the smoother the effect, so for smearing with a round brush you may prefer a value of 0.05 or less. Spacing affects the length of the smudge trail, but to a much lesser extent. The :guilabel:`strength` of the effect remains more or less the same however. 
* Spacing with Dulling: the lower the spacing, the stronger the effect: lowering the spacing too much can make the dulling effect too strong (it picks up a color and never lets go of it). The length of the effect is also affected.
* Both Smearing and Dulling have a "smudge trail", but in the case of Dulling, the brush shape is preserved. Instead, the trail determines how fast the color it picked up is dropped off.

.. _option_smudge_radius:

Smudge Radius
~~~~~~~~~~~~~

The :guilabel:`Smudge Radius` allows you to sample a larger radius when using smudge-length in :guilabel:`Dulling` mode.

The slider is percentage of the brush-size. You can have it modified with :guilabel:`Sensors`.

.. figure:: /images/brushes/colorsmudge/brushengine_smudge_radius.png
   
   A variety of brush strokes using 50% color rate, 50% smudge length and 50% opacity, but different smudge radii. The top stroke is in :dfn:`smear mode` and thus smudge radius is not in effect.

.. versionchanged:: 5.0

   In versions prior to 5.0, Smudge Radius can go up to 3,00,00%, while the program's internal value is 1/100 of the displayed value. Starting from 5.0, the displayed and the internal value of Smudge Radius are unified, they can only go up to 300%, as intended.

.. _option_overlay:

Overlay
~~~~~~~

Overlay is a toggle that determine whether the smudge brush will sample all layers (overlay on), or only the current one.

By default, the Color Smudge Brush only takes information from the layer it is on. However, if you want it to take color information from all the layers, you can turn on the Overlay mode.

Be aware though, that it does so by "picking up" bits of the layer underneath, which may mess up your drawing if you later make changes to the layer underneath.

.. _option_paint_thickness:

Paint Thickness
~~~~~~~~~~~~~~~

.. versionadded:: 5.0

This affects how strong the :ref:`lightness modes <brush_mode>` affect the current color. Because the :dfn:`Color Smudge Brush` smudges, what actually happens is that the lightness part is painted into a separate height map. This prevents the shadows and highlights of the current lightness brush tip from being mixed into the smudge, which would have resulted in all smudges becoming white or black. The height map is discarded when switching brush engines, layers or tools. Because this heightmap only exists for the layer currently being edited, lightness brushes and paint thickness cannot be used together with :ref:`option_overlay`.

.. figure:: /images/brushes/colorsmudge/brushengine_paint_thickness_strength.png

   Image showing off different variations of :dfn:`Paint Thickness`, with the top three strokes being in :dfn:`Smear Mode` and the bottom three in :dfn:`Dulling Mode`. Strengths are 100%, 50%, and 0% from top to bottom.

This has two modes, which change how the existing heightmap is interpreted:

Overwrite (Smooth out when low) existing paint thickness
   Here the lightness value of the brushstroke overrides the value that was there before, effectively smoothing out previous paint if the thickness value is low. The Opacity setting will cause it to blend with the previous paint height, but that will also bring down the color. This mode is useful for a brush that can paint with thickness, but can also smooth out existing paint if you wish.
Paint over existing paint thickness (controlled by smudge length)
   Here the lightness value blends with the previous values, based on the Smudge Length, as described above. It allows the kind of blending with previous paint height that Opacity allows in the Overwrite mode, but without affecting the color rate.

.. figure:: /images/brushes/colorsmudge/brushengine_paint_thickness_type.svg

   Image demonstrating the two modes, with the top strokes being :dfn:`Overwrite Existing Paint Thickness` and the bottom strokes :dfn:`Paint over existing paint thickness`. In both cases, a red stroke was laid with 100% paint thickness. Blue strokes were overlaid going from thin to thick. Notice how the :dfn:`Paint over existing` type differs between 0% and 100% :dfn:`Smudge Length`.

.. _option_hue_sat_val_color_smudge:

Hue, Saturation, Value
~~~~~~~~~~~~~~~~~~~~~~

Identical to :ref:`option_hue_sat_val_pixel` in the Pixel Brush Engine, this will adjust the current foreground color before it is mixed in via :ref:`option_color_rate`. Introduced because this brush engine used to have a small rounding error leading to iridescent smears, which was fixed. Artists who liked this effect can now emulate it by enabling :guilabel:`Hue`, enabling :guilabel:`Fuzzy Dab` and disabling :guilabel:`Pressure` and finally setting :guilabel:`Strength` to 40%.

.. figure:: /images/brushes/colorsmudge/brushengine_smudge_hue_variance.png

   *Top*: without hue variance, *Bottom*: with hue variance.

Hue, Saturation and Value don't affect brush-tips using the :ref:`gradient mode <brush_mode>`.

Brush tips
~~~~~~~~~~

The :dfn:`Color Smudge Brush` has all the same :ref:`option_brush_tip` as the :ref:`pixel_brush_engine`!

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-I.4.png

Just remember that the smudge effects are weaker when a brush tip's opacity is lower, so for low-opacity brush tips, increase the opacity and smudge/color rates.

Scatter and other shape dynamics
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The :dfn:`Color Smudge Brush` shares a number of options with the :ref:`pixel_brush_engine`.

However, because of the Smudge effects, the outcome will be different from the Pixel Brush. In particular, the Scatter option becomes much more significant.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-I.5-1.png

A few things to note:

* Scattering is proportional to the brush size. It's fine to use a scattering of 500% for a tiny round brush, but for bigger brushes, you may want to get it down to 50% or less.
* You may notice the lines with the :guilabel:`Smearing` option. Those are caused by the fact that it picked up the hard lines of the rectangle.
* For scattering, the brush picks up colors within a certain distance, not the color directly under the paintbrush:

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-I.5-2.png


Tutorial: Color Smudge Brushes
------------------------------
 
I recommend at least skimming over the first part to get an idea of what does what.

Smudging and blending
~~~~~~~~~~~~~~~~~~~~~

This part describes use cases with color rate off.

I won't explain the settings for dynamics in detail, as you can find the explanations in the :ref:`Pixel Brush tutorial <pixel_brush_engine>`.

Smudging effects
^^^^^^^^^^^^^^^^

For simple smudging:

* Pick the Color Smudge Brush. You can use either Smearing or Dulling. 

* Turn off Color Rate

* Smudge away

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-II.2.png

When using lower opacity brush tips, remember to "compensate" for the less visible effects by increasing both :guilabel:`Smudge Rate` and :guilabel:`Opacity`, if necessary to maximum.

Some settings for Smearing
""""""""""""""""""""""""""

* For smoother smearing, decrease spacing. Remember that spacing is proportional to brush tip size. For a small round brush, 0.10 spacing is fine, but for mid-sized and large brushes, decrease spacing to 0.05 or less.

Some settings for Dulling
"""""""""""""""""""""""""

* Lowering the spacing will also make the smudging effect stronger, so find a right balance. 0.10 for most mid-sized round brushes should be fine.
* Unlike Smearing, Dulling preserves the brush shape and size, so it won't "fade off" in size like Smearing brushes do. You can mimic that effect through the simple size fade dynamic.

Textured blending
^^^^^^^^^^^^^^^^^

In this case, what I refer to as "Blending" here is simply using one of the following two dynamics:

* :guilabel:`Rotation` set to :guilabel:`Distance` or :guilabel:`Fuzzy`

* And/or Scatter:
    * For most mid-sized brushes you will probably want to lower the scatter rate to 50% or lower. Higher settings are okay for tiny brushes.
    * Note that Scatter picks colors within a certain distance, not the color directly under the brush (see :ref:`option_brush_tip`).
 
* Optional: Pile on size and other dynamics and vary brush tips. In fact, the :dfn:`Color Smudge Brush` is not a blur brush, so smudging is not a very good method of "smooth" blending. To blend smoothly, you'll have better luck with:
* Building up the transition by painting with intermediate values, described later
* Or using the "blur with feathered selection" method that I'll briefly mention at the end of this tutorial.

I've tried to achieve smooth blending with :dfn:`Color Smudge Brush` by adding rotation and scatter dynamics, but honestly they looked like crap.

However, the :dfn:`Color Smudge Brush` is very good at "textured blending":

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-II.3.png

Basically you can paint first and add textured transitions after.

Coloring
~~~~~~~~

For this last section, :guilabel:`Color Rate` is on.

Layer options
^^^^^^^^^^^^^

Before we get started, notice that you have several possibilities for your set-up:

* Shading on the same layer
* Shading on a separate layer, possibly making use of alpha-inheritance. The brush blends with the transparency of the layer it's on. This means:

    * If the area underneath is more of less uniform, the output is actually similar as if shading on the same layer

        * But if the area underneath is not uniform, then you'll get fewer color variations.

* Shading on a separate layer, using :ref:`option_overlay` mode. Use this only if you're fairly sure you don't need to adjust the layer below, or the colors may become a mess.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.1-1.png

Issue with transparency
"""""""""""""""""""""""

The :dfn:`Color Smudge Brush` blends with transparency. What this means is that when you start a new, transparent layer and "paint" on this layer, you will nearly always get less than full opacity.

Basically:

* It may look great when you're coloring on a blank canvas
* But it won't look so great when you add something underneath

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.1-2.png

The solution is pretty simple though:

* Make sure you have the area underneath colored in first:
    * With tinting, you already have the color underneath colored, so that's done
    * For painting, roughly color in the background layer first
    * Or color in the shape on a new layer and make use of alpha-inheritance
* For the last solution, use colors that contrast highly with what you're using for best effect. For example, shade in the darkest shadow area first, or the lightest highlights, and use the color smudge brush for the contrasting color.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.1-3.png

Soft-shading
~~~~~~~~~~~~

Suppose you want more or less smooth color transitions. You can either:

* :guilabel:`Color Rate` as low as 10% for round brushes, higher with non fully opaque brush tips.
* Or set the :guilabel:`Smudge Rate` as low as 10% instead. 
* Or a combination of the two. Please try yourself for the output you like best.
* Optional: turn on :guilabel:`Rotation` for smoother blending.
* Optional: turn on :guilabel:`Scatter` for certain effects.
* Optional: fiddle with :guilabel:`Size` and :guilabel:`Opacity` dynamics as necessary.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.2-1.png

This remains, in fact, a so-so way of making smooth transitions. It's best to build up intermediate values instead. Here:

* I first passed over the blue area three times with a red color. I select 3 shades.
* I color picked each of these values with the :kbd:`Ctrl +` |mouseleft| shortcut, then used them in succession.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.2-2.png

Painting: thick oil style
~~~~~~~~~~~~~~~~~~~~~~~~~

Many of the included color smudge brush presets produce a thick oil paint-like effect.
This is mainly achieved with the Smearing mode on. Basically:

* Smearing mode with high smudge and color rates
    * Both at 0.50 are fine for normal round brushes or fully opaque predefined brushes
    * Up to 1.00 each for brushes with less density or non fully-opaque predefined brushes
   
* Add Size/Rotation/Scatter dynamics as needed. When you do this, increase smudge and color rates to compensate for increased color mixing.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.3-1.png

One thing I really like to do is to set different foreground and background colors, then turn on :menuselection:`Gradient --> Fuzzy`. Alternatively, just paint with different colors in succession (bottom-right example).

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.3-2.png

Here's some final random stuff. With pixel brushes, you can get all sorts of frill designs by using elongated brushes and setting the dynamics to rotation. You won't get that with Color Smudge Brushes. Instead, you'll get something that looks more like... yarn. Which is cool too. Here, I just used oval brushes and :menuselection:`Rotation --> Distance`.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.3-3.png

Painting: Digital watercolor style
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When I say "digital watercolor", it refers to a style often seen online, i.e. a soft, smooth shading style rather than realistic watercolor. For this you mostly need the Dulling mode. A few things:

* Contrary to the Smearing mode, you may want to lower opacity for normal round brushes to get a smoother effect, to 70% for example.
* Vary the brush tip fade value as well.
* When using :guilabel:`Scatter` or other dynamics, you can choose to set smudge and color values to high or low values, for different outcomes.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.4.png

Blurring
~~~~~~~~

You can:

* Paint then smudge, for mostly texture transitions
* Or build up transitions by using intermediate color values

If you want even smoother effects, well, just use blur. Gaussian blur to be exact.

.. image:: /images/brushes/colorsmudge/Krita-tutorial5-III.5.png

And there you go. That last little trick concludes this tutorial.

