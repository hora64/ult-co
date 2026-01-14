export const xDebugEnUS = [
  // NEW: Comprehensive feature test article for slug links and confirm button
  {
    slug: "feature-test-slug-confirm",
    title: "🧪 Feature Test: Slug Links & Confirm Button",
    publisher: "Ult & Co. Testing Lab",
    author: "Feature Testing Team",
    authorProfile: {
      name: "Feature Testing Team",
      avatar: "/content/common/assets/icons/user_64px.png",
      role: "QA Engineers",
      bio: "Testing new article navigation and interaction features"
    },
    content: "Complete test suite for article slug navigation and confirm read functionality.",
    image: "https://placehold.co/400x240/007bff/ffffff?text=Feature+Test/png",
    
    pages: [
      {
        label: "Introduction",
        image: "https://placehold.co/400x240/007bff/ffffff?text=Welcome/png",
        content: 
          "{style:bold|Feature Test: Slug Links & Confirm Button}\n\n" +
          "This article tests the following new features:\n\n" +
          "---\n\n" +
          "{style:bold|1. Slug Link Navigation:}\n" +
          "  * Navigate directly to specific article pages\n" +
          "  * Use Article.navigateToArticle(app, slug, pageIndex)\n" +
          "  * Deep linking support\n\n" +
          "{style:bold|2. Confirm Button:}\n" +
          "  * Replace next arrow with confirm button on last page\n" +
          "  * Requires user confirmation before closing\n" +
          "  * Useful for rules, agreements, tutorials\n\n" +
          "{style:bold|3. Footer Button Corners:}\n" +
          "  * Fixed: TOP corners rounded (not bottom)\n" +
          "  * Visual alignment with article container\n\n" +
          "---\n\n" +
          "Navigate through all pages to test these features!"
      },

      {
        label: "Slug Navigation",
        image: "https://placehold.co/400x240/28a745/ffffff?text=Navigation/png",
        content: 
          "{style:bold|Testing Slug Link Navigation}\n\n" +
          "The article component now supports direct navigation:\n\n" +
          "---\n\n" +
          "{style:bold|Static Method:}\n" +
          "{style:italic|Article.navigateToArticle(app, slug, pageIndex)}\n\n" +
          "{style:bold|Parameters:}\n" +
          "  * app - Application instance\n" +
          "  * slug - Article identifier\n" +
          "  * pageIndex - Target page (optional, defaults to 0)\n\n" +
          "---\n\n" +
          "{style:bold|Example Usage:}\n\n" +
          "{style:color=#0066cc|// Navigate to first page}\n" +
          "Article.navigateToArticle(app, 'feature-test-slug-confirm', 0)\n\n" +
          "{style:color=#0066cc|// Navigate to specific page}\n" +
          "Article.navigateToArticle(app, 'feature-test-slug-confirm', 2)\n\n" +
          "---\n\n" +
          "{style:bold|Use Cases:}\n" +
          "  * Deep linking from notifications\n" +
          "  * Cross-article references\n" +
          "  * Tutorial step navigation\n" +
          "  * Context-specific help pages"
      },

      {
        label: "Confirm Button",
        image: "https://placehold.co/400x240/ffc107/333333?text=Confirm/png",
        content: 
          "{style:bold|Confirm Button Implementation}\n\n" +
          "Pages can require confirmation before closing:\n\n" +
          "---\n\n" +
          "{style:bold|Page Configuration:}\n" +
          "{\n" +
          "  label: \"Page Title\",\n" +
          "  content: \"...\",\n" +
          "  {style:color=#28a745|requireConfirm: true},\n" +
          "  {style:color=#28a745|onConfirm: (article) => {\n" +
          "    console.log('User confirmed reading');\n" +
          "  }}\n" +
          "}\n\n" +
          "---\n\n" +
          "{style:bold|Behavior:}\n" +
          "  * On last visible page with requireConfirm\n" +
          "  * Next arrow (►) becomes checkmark (✓)\n" +
          "  * Button turns green\n" +
          "  * Executes onConfirm callback\n" +
          "  * Then closes article\n\n" +
          "---\n\n" +
          "{style:bold|Use Cases:}\n" +
          "  * Terms & conditions\n" +
          "  * Tutorial completion\n" +
          "  * Contest rules acknowledgment\n" +
          "  * Safety guidelines"
      },

      {
        label: "Visual Fixes",
        image: "https://placehold.co/400x240/6c757d/ffffff?text=UI+Polish/png",
        content: 
          "{style:bold|Footer Button Corner Fixes}\n\n" +
          "Corrected border radius placement:\n\n" +
          "---\n\n" +
          "{style:bold|Previous (Incorrect):}\n" +
          "  * Bottom corners rounded\n" +
          "  * Didn't align with article container\n\n" +
          "{style:bold|Current (Fixed):}\n" +
          "  * {style:color=#28a745|TOP corners rounded}\n" +
          "  * Aligns with article visual flow\n" +
          "  * Better UX consistency\n\n" +
          "---\n\n" +
          "{style:bold|Implementation:}\n\n" +
          "{style:color=#0066cc|// Close button (multi-page)}\n" +
          "borderRadius: [8, 0, 0, 0] {style:color=#999999|// top-left}\n\n" +
          "{style:color=#0066cc|// Next/Confirm button}\n" +
          "borderRadius: [0, 8, 0, 0] {style:color=#999999|// top-right}\n\n" +
          "{style:color=#0066cc|// Single button (no pages)}\n" +
          "borderRadius: [8, 8, 0, 0] {style:color=#999999|// both top}\n\n" +
          "---\n\n" +
          "{style:bold|Format:}\n" +
          "[top-left, top-right, bottom-right, bottom-left]"
      },

      {
        label: "Final Page",
        image: "https://placehold.co/400x240/9c27b0/ffffff?text=Complete!/png",
        requireConfirm: true,
        onConfirm: function(article) {
          console.log('[Test Article] User confirmed reading all pages of:', article.title);
          alert('Thank you for reviewing all features! The confirm button worked correctly.');
        },
        content: 
          "{style:bold|✅ Congratulations!}\n\n" +
          "You've reached the final page of the feature test.\n\n" +
          "---\n\n" +
          "{style:bold|Notice the Changes:}\n\n" +
          "  ✓ {style:color=#28a745|The next arrow (►) is now a checkmark (✓)}\n" +
          "  ✓ {style:color=#28a745|Button is green instead of beige}\n" +
          "  ✓ {style:color=#28a745|Clicking will trigger confirmation}\n\n" +
          "---\n\n" +
          "{style:bold|Testing Instructions:}\n\n" +
          "1. Look at the footer buttons\n" +
          "2. Confirm the checkmark (✓) button is visible\n" +
          "3. Confirm it's green (#28a745)\n" +
          "4. Click it to confirm reading\n" +
          "5. An alert will display upon confirmation\n\n" +
          "---\n\n" +
          "{style:bold|All Features Tested:}\n" +
          "  ✓ Slug link navigation (static method)\n" +
          "  ✓ Page-specific images\n" +
          "  ✓ Confirm button replacement\n" +
          "  ✓ onConfirm callback execution\n" +
          "  ✓ Footer corner rounding (top corners)\n\n" +
          "---\n\n" +
          "{style:bold,color=#28a745|Click the green checkmark to confirm!}"
      }
    ],
    
    date: "2026-01-24T18:00:00Z",
    iconPath: "/content/common/assets/icons/message_64px.png",
    tags: ["Test", "Features", "Navigation", "Confirm", "UI"],
    visible: true,
    debugArticle: true,
    favoritable: true,
    unreadIndicator: {
      type: "star",
      color: "#007bff"
    },
    credits: [
      "Feature Testing Team",
      "QA Team",
      "UI/UX Team",
      "Development Team"
    ]
  },

  {
    slug: "complete-rich-text-reference",
    title: "Complete Rich Text Reference Guide",
    publisher: "Ult & Co. Testing Lab",
    author: "Rich Text Documentation Team",
    authorProfile: {
      name: "Documentation Team",
      avatar: "/content/common/assets/icons/user_64px.png",
      role: "Technical Writers",
      bio: "Comprehensive documentation for all rich text features"
    },
    content: "Complete reference guide for all rich text formatting, effects, and syntax.",
    image: "https://placehold.co/400x240/6c757d/ffffff?text=Rich+Text+Guide/png",
    
    pages: [
      // ============================================
      // CRITICAL INFORMATION
      // ============================================
      {
        label: "Read First",
        image: "https://placehold.co/400x240/dc3545/ffffff?text=Important+Warning/png",
        content: 
          "{style:bold,color=#dc3545|CRITICAL LIMITATION: EFFECTS CANNOT BE NESTED}\n\n" +
          "Before using any effects, you MUST understand this limitation.\n\n" +
          "---\n\n" +
          "{style:bold|What Does NOT Work:}\n\n" +
          "You CANNOT nest special effects inside each other:\n\n" +
          "{style:bold|Nesting Effects:}\n" +
          "   {style:italic|{{staticglow:cyan|{{staticmetallic:gold|Nested}}}}}\n" +
          "   {style:color=#dc3545|X BROKEN - Only innermost effect renders!}\n\n" +
          "{style:bold|Multiple Effects:}\n" +
          "   {style:italic|{{fire|{{rainbow|Double Effect}}}}}\n" +
          "   {style:color=#dc3545|X BROKEN - Rendering breaks!}\n\n" +
          "{style:bold|Styles Inside Effects:}\n" +
          "   {style:italic|{{style:bold|{{staticmetallic:gold|Text}}}}}\n" +
          "   {style:color=#dc3545|X NOT POSSIBLE - Will never work!}\n\n" +
          "---\n\n" +
          "{style:bold|THE GOLDEN RULE}\n\n" +
          "Effects MUST be used standalone:\n" +
          "  * Use effects by themselves: {style:italic|{{staticmetallic:gold|Text}}}\n" +
          "  * Cannot combine with styles\n" +
          "  * Cannot nest effects\n" +
          "  * One effect per text segment only\n\n" +
          "{style:bold|If you need formatting:}\n" +
          "  * Apply styles separately from effects\n" +
          "  * Use multiple text segments\n" +
          "  * Example: {style:italic|{{style:bold|Bold text}}} and {style:italic|{{staticmetallic:gold|gold text}}}"
      },

      // ============================================
      // TABLE OF CONTENTS
      // ============================================
      {
        label: "Index",
        image: "https://placehold.co/400x240/6c757d/ffffff?text=Table+of+Contents/png",
        content: 
          "{style:bold|Complete Rich Text Reference Guide}\n\n" +
          "{style:bold,italic|All Features - Organized by Category}\n\n" +
          "---\n\n" +
          "{style:bold|Basic Formatting:}\n" +
          "Text Styles (bold, italic, underline, strikethrough)\n" +
          "Colors (hex codes)\n" +
          "Unified Syntax (for basic styles only)\n\n" +
          "{style:bold|Material Effects:}\n" +
          "Metallic (17 types), Gemstone (15 types), Fine Glitter (19 colors), Hologram (7 colors)\n\n" +
          "{style:bold|Natural Elements:}\n" +
          "Wood (9 types), Stone (7 types), Fire (3 types), Ice (3 types), Water (6 types), Magma (3 types)\n\n" +
          "{style:bold|Special Effects:}\n" +
          "3D, Neon, OutlineGlow, Steel\n\n" +
          "---\n\n" +
          "{style:bold|Navigation:}\n" +
          "Use left/right arrow buttons or thumbnails\n\n" +
          "Total: {style:bold|70+ Effect Variants + All Basic Formatting}"
      },

      // ============================================
      // BASIC FORMATTING
      // ============================================
      {
        label: "Text Styles",
        image: "https://placehold.co/400x240/2980b9/ffffff?text=Text+Styles/png",
        content: 
          "{style:bold|Basic Text Styles}\n\n" +
          "{style:bold|Bold Text} - Important information\n" +
          "{style:italic|Italic Text} - Emphasis\n" +
          "{style:bold,italic|Bold + Italic} - Strong emphasis\n" +
          "{style:underline|Underlined Text} - Links or emphasis\n" +
          "{style:strikethrough|Strikethrough Text} - Deprecated content\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{style:bold|text}}}\n" +
          "{style:italic|{{style:italic|text}}}\n" +
          "{style:italic|{{style:bold,italic|text}}}\n" +
          "{style:italic|{{style:underline|text}}}\n" +
          "{style:italic|{{style:strikethrough|text}}}\n\n" +
          "---\n\n" +
          "{style:bold|Combining Styles:}\n" +
          "You can combine multiple styles:\n" +
          "{style:bold,italic,underline|Bold + Italic + Underline}\n\n" +
          "{style:bold|Canceling Formatting:}\n" +
          "Nesting the same style cancels the formatting:\n" +
          "{style:italic|Italic text with {style:italic|cancelled formatting} inside.}"
      },

      {
        label: "Colors",
        image: "https://placehold.co/400x240/e74c3c/ffffff?text=Color+Effects/png",
        content: 
          "{style:bold|Color Effects}\n\n" +
          "{style:bold|Hex Colors (Recommended):}\n" +
          "{style:color=#ff0000|Red} {style:color=#0000ff|Blue} {style:color=#00ff00|Green} {style:color=#ff8c00|Orange}\n" +
          "{style:color=#800080|Purple} {style:color=#ffff00|Yellow} {style:color=#ffc0cb|Pink} {style:color=#00ffff|Cyan}\n" +
          "{style:color=#a52a2a|Brown} {style:color=#808080|Gray} {style:color=#000000|Black}\n\n" +
          "{style:bold|Example Hex Codes:}\n" +
          "{style:color=#ff0000|#ff0000 - Pure Red}\n" +
          "{style:color=#00ff00|#00ff00 - Pure Green}\n" +
          "{style:color=#0000ff|#0000ff - Pure Blue}\n" +
          "{style:color=#ffc107|#ffc107 - Amber Gold}\n" +
          "{style:color=#e91e63|#e91e63 - Magenta}\n" +
          "{style:color=#9c27b0|#9c27b0 - Deep Purple}\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{style:color=#RRGGBB|text}}}\n\n" +
          "---\n\n" +
          "{style:bold|Use Cases:}\n" +
          "  * Red - Errors, warnings, important\n" +
          "  * Blue - Information, links\n" +
          "  * Green - Success, confirmation\n" +
          "  * Orange - Warnings, attention\n" +
          "  * Purple - Special, premium"
      },

      {
        label: "Combinations",
        image: "https://placehold.co/400x240/16a085/ffffff?text=Combined+Formatting/png",
        content: 
          "{style:bold|Combined Formatting}\n\n" +
          "{style:bold|Style + Color:}\n" +
          "{style:bold,color=#dc3545|Bold Red}\n" +
          "{style:italic,color=#007bff|Italic Blue}\n" +
          "{style:bold,underline,color=#28a745|Bold Underline Green}\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{style:bold,color=#dc3545|text}}}\n" +
          "{style:italic|{{style:italic,color=#007bff|text}}}\n" +
          "{style:italic|{{style:bold,underline,color=#28a745|text}}}\n\n" +
          "---\n\n" +
          "{style:bold|Complex Examples:}\n" +
          "{style:bold,italic,color=#ffc107|Gold Bold Italic}\n" +
          "{style:underline,color=#00ff00|Green Underline}\n\n" +
          "---\n\n" +
          "All basic formatting can be freely combined using comma-separated properties!"
      },

      {
        label: "Unified Syntax",
        image: "https://placehold.co/400x240/4ecdc4/ffffff?text=Unified+Syntax/png",
        content: 
          "{style:bold|Unified Style Syntax}\n\n" +
          "The {style:bold|unified {{style:...}}} syntax allows you to specify multiple BASIC properties in ONE tag.\n\n" +
          "---\n\n" +
          "{style:bold|Key Syntax Pattern:}\n" +
          "{style:italic|{{style:property1,property2,property3=value|text}}}\n\n" +
          "---\n\n" +
          "{style:bold|What You Can Include:}\n" +
          "  * Basic styles: bold, italic, underline, strikethrough\n" +
          "  * Colors: color=#RRGGBB\n\n" +
          "{style:bold,color=#dc3545|IMPORTANT LIMITATION:}\n" +
          "Material effects (metallic, gemstone, glitter, etc.) and special effects (fire, ice, water, etc.) {style:bold|CANNOT} be used in unified syntax.\n\n" +
          "You MUST use their standalone syntax:\n" +
          "  * {style:italic|{{staticmetallic:gold|text}}} - Correct\n" +
          "  * {style:italic|{{style:staticmetallic=gold|text}}} - Does NOT work\n\n" +
          "---\n\n" +
          "{style:bold|Valid Examples:}\n" +
          "{style:bold,color=#dc3545|Bold Red Text}\n" +
          "{style:bold,italic,color=#ffc107|Bold Italic Gold}\n" +
          "{style:italic,underline,color=#00ff00|Italic Underline Green}\n\n" +
          "---\n\n" +
          "{style:bold|Benefits:}\n" +
          "  - Cleaner, more readable markup for basic styles\n" +
          "  - All basic formatting in one place\n" +
          "  - Easier to maintain"
      },

      // ============================================
      // MATERIAL EFFECTS
      // ============================================
      {
        label: "Metallic",
        image: "https://placehold.co/400x240/fd7e14/ffffff?text=Metallic+Effects/png",
        content: 
          "{style:bold|Metallic - All 17 Types}\n\n" +
          "{style:bold|Traditional Metals:}\n" +
          "{staticmetallic:gold|Gold} " +
          "{staticmetallic:silver|Silver} " +
          "{staticmetallic:bronze|Bronze} " +
          "{staticmetallic:copper|Copper}\n" +
          "{staticmetallic:platinum|Platinum} " +
          "{staticmetallic:steel|Steel} " +
          "{staticmetallic:rosegold|RoseGold}\n" +
          "{staticmetallic:titanium|Titanium} " +
          "{staticmetallic:chrome|Chrome}\n\n" +
          "{style:bold|Colored Metallics:}\n" +
          "{staticmetallic:red|Red} " +
          "{staticmetallic:blue|Blue} " +
          "{staticmetallic:green|Green}\n" +
          "{staticmetallic:purple|Purple} " +
          "{staticmetallic:pink|Pink} " +
          "{staticmetallic:yellow|Yellow}\n" +
          "{staticmetallic:orange|Orange} " +
          "{staticmetallic:cyan|Cyan}\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{staticmetallic:type|text}}}\n\n" +
          "Total: {style:bold|17 types (9 traditional + 8 colored)}"
      },

      {
        label: "Gemstone",
        image: "https://placehold.co/400x240/9c27b0/ffffff?text=Gemstone+Effects/png",
        content: 
          "{style:bold|Gemstone - All 15 Types}\n\n" +
          "{style:bold|Precious Stones:}\n" +
          "{staticgemstone:diamond|Diamond} " +
          "{staticgemstone:ruby|Ruby} " +
          "{staticgemstone:sapphire|Sapphire} " +
          "{staticgemstone:emerald|Emerald}\n\n" +
          "{style:bold|Semi-Precious (Part 1):}\n" +
          "{staticgemstone:amethyst|Amethyst} " +
          "{staticgemstone:topaz|Topaz} " +
          "{staticgemstone:jade|Jade} " +
          "{staticgemstone:opal|Opal}\n\n" +
          "{style:bold|Semi-Precious (Part 2):}\n" +
          "{staticgemstone:aquamarine|Aquamarine} " +
          "{staticgemstone:peridot|Peridot} " +
          "{staticgemstone:garnet|Garnet}\n\n" +
          "{style:bold|Other Types:}\n" +
          "{staticgemstone:citrine|Citrine} " +
          "{staticgemstone:tourmaline|Tourmaline} " +
          "{staticgemstone:onyx|Onyx} " +
          "{staticgemstone:pearl|Pearl}\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{staticgemstone:type|text}}}\n\n" +
          "Total: {style:bold|15 types}"
      },

      {
        label: "Glitter",
        image: "https://placehold.co/400x240/ffc107/ffffff?text=Glitter+Effects/png",
        content: 
          "{style:bold|Fine Glitter - All 19 Colors}\n\n" +
          "{style:bold|Metallic Glitters:}\n" +
          "{staticfineglitter:gold|Gold} " +
          "{staticfineglitter:silver|Silver} " +
          "{staticfineglitter:bronze|Bronze}\n\n" +
          "{style:bold|Primary Colors:}\n" +
          "{staticfineglitter:red|Red} " +
          "{staticfineglitter:green|Green} " +
          "{staticfineglitter:blue|Blue} " +
          "{staticfineglitter:yellow|Yellow}\n\n" +
          "{style:bold|Secondary Colors:}\n" +
          "{staticfineglitter:purple|Purple} " +
          "{staticfineglitter:pink|Pink} " +
          "{staticfineglitter:orange|Orange} " +
          "{staticfineglitter:cyan|Cyan} " +
          "{staticfineglitter:teal|Teal} " +
          "{staticfineglitter:lime|Lime}\n\n" +
          "{style:bold|Gemstone-Inspired:}\n" +
          "{staticfineglitter:rose|Rose} " +
          "{staticfineglitter:emerald|Emerald} " +
          "{staticfineglitter:ruby|Ruby} " +
          "{staticfineglitter:sapphire|Sapphire}\n\n" +
          "{style:bold|Monochrome:}\n" +
          "{staticfineglitter:black|Black} " +
          "{staticfineglitter:white|White}\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{staticfineglitter:color|text}}}\n\n" +
          "Total: {style:bold|19 colors}"
      },

      {
        label: "Hologram",
        image: "https://placehold.co/400x240/00d4ff/ffffff?text=Hologram+Effect/png",
        content: 
          "{style:bold|Hologram Effect - All 7 Colors}\n\n" +
          "{statichologram:red|Red Hologram} " +
          "{statichologram:green|Green Hologram} " +
          "{statichologram:blue|Blue Hologram}\n" +
          "{statichologram:yellow|Yellow Hologram} " +
          "{statichologram:pink|Pink Hologram}\n" +
          "{statichologram:purple|Purple Hologram} " +
          "{statichologram:cyan|Cyan Hologram}\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{statichologram:color|text}}}\n" +
          "{style:italic|{{statichologram|text}}} (cyan default)\n\n" +
          "Colors: red, green, blue, yellow, pink, purple, cyan\n\n" +
          "Holographic rainbow shimmer with color variants."
      },

      // ============================================
      // NATURAL ELEMENTS
      // ============================================
      {
        label: "Wood",
        image: "https://placehold.co/400x240/8b4513/ffffff?text=Wood+Effects/png",
        content: 
          "{style:bold|Wood Effect - All 9 Types}\n\n" +
          "{style:bold|Light Woods:}\n" +
          "{wood:type=pine|Pine Wood} - Lightest\n" +
          "{wood:type=birch|Birch Wood} - Pale cream\n" +
          "{wood:type=maple|Maple Wood} - Light golden\n" +
          "{wood:type=ash|Ash Wood} - Light gray-brown\n\n" +
          "{style:bold|Medium Woods:}\n" +
          "{wood:type=oak|Oak Wood} - Classic (default)\n" +
          "{wood:type=cherry|Cherry Wood} - Reddish\n\n" +
          "{style:bold|Dark Woods:}\n" +
          "{wood:type=mahogany|Mahogany Wood} - Deep red-brown\n" +
          "{wood:type=walnut|Walnut Wood} - Rich brown\n" +
          "{wood:type=ebony|Ebony Wood} - Darkest\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{wood:type=oak|text}}}\n\n" +
          "Types: pine, birch, maple, ash, oak, cherry, mahogany, walnut, ebony"
      },

      {
        label: "Stone",
        image: "https://placehold.co/400x240/708090/ffffff?text=Stone+Effects/png",
        content: 
          "{style:bold|Stone Effect - All 7 Types}\n\n" +
          "{style:bold|Layered Stones:}\n" +
          "{stone:type=slate|Slate Stone} - Layered gray (default)\n" +
          "{stone:type=sandstone|Sandstone} - Grainy tan\n" +
          "{stone:type=limestone|Limestone} - Chalky white\n\n" +
          "{style:bold|Speckled Stones:}\n" +
          "{stone:type=granite|Granite Stone} - Speckled gray\n\n" +
          "{style:bold|Smooth Stones:}\n" +
          "{stone:type=marble|Marble Stone} - Veined white\n" +
          "{stone:type=obsidian|Obsidian} - Volcanic glass\n\n" +
          "{style:bold|Textured Stones:}\n" +
          "{stone:type=cobblestone|Cobblestone} - Brick pattern\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{stone:type=granite|text}}}\n\n" +
          "Types: slate, sandstone, limestone, granite, marble, obsidian, cobblestone"
      },

      {
        label: "Fire",
        image: "https://placehold.co/400x240/ff4500/ffffff?text=Fire+Effects/png",
        content: 
          "{style:bold|Fire Effect - All 3 Types (Static)}\n\n" +
          "{style:bold|Normal Fire:}\n" +
          "{staticfire:type=normal|Normal Fire} - Classic orange flames\n\n" +
          "{style:bold|Soul Fire:}\n" +
          "{staticfire:type=soulfire|Soul Fire} - Mystical blue flames\n\n" +
          "{style:bold|Smokeless Fire:}\n" +
          "{staticfire:type=smokeless|Smokeless Fire} - Clean red flames\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{staticfire:type=normal|text}}}\n" +
          "{style:italic|{{staticfire:type=soulfire|text}}}\n" +
          "{style:italic|{{staticfire:type=smokeless|text}}}\n\n" +
          "Types: normal, soulfire, smokeless"
      },

      {
        label: "Ice",
        image: "https://placehold.co/400x240/87ceeb/ffffff?text=Ice+Effects/png",
        content: 
          "{style:bold|Ice Effect - All 3 Types (Static)}\n\n" +
          "{style:bold|Crystal Ice:}\n" +
          "{staticice:type=crystal|Crystal Ice} - Bright blue (default)\n\n" +
          "{style:bold|Glacier Ice:}\n" +
          "{staticice:type=glacier|Glacier Ice} - Pale blue\n" +
          "{style:bold|Black Ice:}\n" +
          "{staticice:type=blackice|Black Ice} - Dark gray-blue\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{staticice:type=crystal|text}}}\n" +
          "{style:italic|{{staticice:type=glacier|text}}}\n" +
          "{style:italic|{{staticice:type=blackice|text}}}\n\n" +
          "Types: crystal, glacier, blackice"
      },

      {
        label: "Water",
        image: "https://placehold.co/400x240/3498db/ffffff?text=Water+Effects/png",
        content: 
          "{style:bold|Water Effect - All 6 Types (Static)}\n\n" +
          "{style:bold|Clear Water:}\n" +
          "{staticwater:type=clear|Clear Water} - Bright blue (default)\n\n" +
          "{style:bold|Ocean Water:}\n" +
          "{staticwater:type=ocean|Ocean Water} - Deep blue\n" +
          "{style:bold|Pond Water:}\n" +
          "{staticwater:type=pond|Pond Water} - Green tint\n\n" +
          "{style:bold|Swamp Water:}\n" +
          "{staticwater:type=swamp|Swamp Water} - Murky brown\n" +
          "{style:bold|Frozen Water:}\n" +
          "{staticwater:type=frozen|Frozen Water} - Icy blue\n" +
          "{style:bold|Beach Water:}\n" +
          "{staticwater:type=beach|Beach Water} - Turquoise\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{staticwater:type=ocean|text}}}\n" +
          "{style:italic|{{staticwater:type=clear|text}}}\n\n" +
          "Types: clear, ocean, pond, swamp, frozen, beach"
      },

      {
        label: "Magma",
        image: "https://placehold.co/400x240/ff6600/ffffff?text=Magma+Effects/png",
        content: 
          "{style:bold|Magma Effect - All 3 Types (Static)}\n\n" +
          "{style:bold|Classic Magma:}\n" +
          "{staticmagma:type=classic|Classic Magma} - Orange lava (default)\n\n" +
          "{style:bold|Obsidian Magma:}\n" +
          "{staticmagma:type=obsidian|Obsidian Magma} - Purple volcanic\n\n" +
          "{style:bold|Toxic Magma:}\n" +
          "{staticmagma:type=toxic|Toxic Magma} - Green toxic\n\n" +
          "---\n\n" +
          "{style:bold|Syntax:}\n" +
          "{style:italic|{{staticmagma:type=classic|text}}}\n" +
          "{style:italic|{{staticmagma:type=obsidian|text}}}\n" +
          "{style:italic|{{staticmagma:type=toxic|text}}}\n\n" +
          "Types: classic, obsidian, toxic"
      },

      // ============================================
      // SPECIAL EFFECTS
      // ============================================
      {
        label: "3D Effects",
        image: "https://placehold.co/400x240/17a2b8/ffffff?text=3D+Effects/png",
        content: 
          "{style:bold|3D Effects}\n\n" +
          "{style:bold|Standard 3D:}\n" +
          "{threeD|3D Depth Text}\n" +
          "Syntax: {style:italic|{{threeD|text}}}\n\n" +
          "{style:bold|3D with Shadow:}\n" +
          "{textshadow3d|Shadowed 3D Text}\n" +
          "Syntax: {style:italic|{{textshadow3d|text}}}\n\n" +
          "---\n\n" +
          "Both effects create three-dimensional depth.\n" +
          "TextShadow3D adds multiple shadow layers for enhanced depth."
      },

      {
        label: "Neon",
        image: "https://placehold.co/400x240/e83e8c/ffffff?text=Neon+Effect/png",
        content: 
          "{style:bold|Neon Effect}\n\n" +
          "{neon:cyan,15|Neon Sign Text}\n" +
          "{neon:pink,20|Pink Neon}\n" +
          "{neon:yellow,10|Yellow Neon}\n\n" +
          "Syntax: {style:italic|{{neon:color,blur|text}}}\n\n" +
          "Static neon sign glow effect.\n" +
          "Color: Any color name or hex code\n" +
          "Blur: Glow intensity (pixels)"
      },

      {
        label: "OutlineGlow",
        image: "https://placehold.co/400x240/20c997/ffffff?text=Outline+Glow/png",
        content: 
          "{style:bold|Outline Glow}\n\n" +
          "{outlineglow:cyan,1,5|Cyan Outline}\n" +
          "{outlineglow:pink,2,8|Pink Outline}\n" +
          "{outlineglow:#ff0000,1,10|Red Outline}\n\n" +
          "Syntax: {style:italic|{{outlineglow:color,width,blur|text}}}\n\n" +
          "Glowing outline around text.\n" +
          "Color: Color name or hex code\n" +
          "Width: Outline thickness (pixels)\n" +
          "Blur: Glow intensity (pixels)"
      },

      {
        label: "Steel",
        image: "https://placehold.co/400x240/495057/ffffff?text=Steel+Effect/png",
        content: 
          "{style:bold|Steel Effect}\n\n" +
          "{steel|Steel Metal Text}\n\n" +
          "Syntax: {style:italic|{{steel|text}}}\n\n" +
          "Brushed steel metal texture."
      },

      // ============================================
      // SUMMARY
      // ============================================
      {
        label: "Summary",
        image: "https://placehold.co/400x240/28a745/ffffff?text=Complete+Guide/png",
        content: 
          "{style:bold|Complete Rich Text Reference Summary}\n\n" +
          "All Features Documented!\n\n" +
          "---\n\n" +
          "{style:bold|Basic Formatting:}\n" +
          "  - Text styles (bold, italic, underline, strikethrough)\n" +
          "  - Colors (hex codes with color=#RRGGBB)\n" +
          "  - Unified syntax for combining basic styles\n\n" +
          "{style:bold|Material Effects:}\n" +
          "  * Metals: 17 types (9 traditional + 8 colored)\n" +
          "  * Gems: 15 types (4 precious + 11 semi-precious)\n" +
          "  * Glitter: 19 colors\n" +
          "  * Hologram: 7 colors\n\n" +
          "{style:bold|Natural Elements:}\n" +
          "  * Wood: 9 types (light, medium, dark)\n" +
          "  * Stone: 7 types (layered, speckled, smooth)\n" +
          "  * Fire: 3 types (normal, soul, smokeless)\n" +
          "  * Ice: 3 types (crystal, glacier, black)\n" +
          "  * Water: 6 types (clear, ocean, pond, swamp, frozen, beach)\n" +
          "  * Magma: 3 types (classic, obsidian, toxic)\n\n" +
          "{style:bold|Special Effects:}\n" +
          "  * 3D (2 variants), Neon, OutlineGlow, Steel\n\n" +
          "---\n\n" +
          "{style:bold|Important Notes:}\n" +
          "  * Unified syntax works for basic styles only\n" +
          "  * Material and special effects must use standalone syntax\n" +
          "  * Effects cannot be nested\n" +
          "  * Only static versions of animated effects are shown\n\n" +
          "Total: {style:bold|70+ effect variants + complete basic formatting!}"
      }
    ],
    
    date: "2026-01-24T10:00:00Z",
    iconPath: "/content/common/assets/icons/message_64px.png",
    tags: ["Reference", "Documentation", "Effects", "Formatting", "Complete"],
    visible: true,
    debugArticle: true,
    favoritable: true,
    unreadIndicator: {
      type: "star",
      color: "#6c757d"
    },
    credits: [
      "Documentation Team",
      "Effects Team",
      "QA Team",
      "Development Team",
      "UI/UX Team"
    ]
  },

  // ============================================
  // UNREAD INDICATOR TEST ARTICLES
  // ============================================
  {
    slug: "unread-indicator-star-purple",
    title: "Star Indicator - Purple",
    publisher: "Ult & Co. Testing Lab",
    author: "UI Testing Team",
    authorProfile: {
      name: "UI Tester",
      avatar: "/content/common/assets/icons/user_64px.png",
      role: "QA Engineer",
      bio: "Testing unread indicator functionality"
    },
    content: "Test article showcasing purple star unread indicator for special/featured content.",
    image: "https://placehold.co/400x240/9c27b0/ffffff?text=Star+Purple/png",
    
    pages: [
      {
        label: "Overview",
        image: "https://placehold.co/400x240/9c27b0/ffffff?text=Star+Indicator/png",
        content: 
          "{style:bold|Star Indicator Test - Purple}\n\n" +
          "This article uses a {style:bold,color=#9c27b0|purple star} indicator.\n\n" +
          "---\n\n" +
          "{style:bold|Configuration:}\n" +
          "Type: {style:italic|star}\n" +
          "Color: {style:italic|#9c27b0 (Purple)}\n\n" +
          "{style:bold|Best Used For:}\n" +
          "  * Featured content\n" +
          "  * Special announcements\n" +
          "  * Premium articles\n" +
          "  * VIP content\n\n" +
          "---\n\n" +
          "{style:bold|Visual Characteristics:}\n" +
          "  * Star shape icon\n" +
          "  * Purple color scheme\n" +
          "  * High visibility\n" +
          "  * Premium feel"
      }
    ],
    
    date: "2026-01-24T14:00:00Z",
    iconPath: "/content/common/assets/icons/message_64px.png",
    tags: ["Test", "UI", "Indicator", "Star", "Purple"],
    visible: true,
    debugArticle: true,
    favoritable: true,
    unreadIndicator: {
      type: "star",
      color: "#9c27b0"
    },
    credits: ["UI Testing Team", "QA Team"]
  },

  {
    slug: "unread-indicator-dot-blue",
    title: "Dot Indicator - Blue",
    publisher: "Ult & Co. Testing Lab",
    author: "UI Testing Team",
    authorProfile: {
      name: "UI Tester",
      avatar: "/content/common/assets/icons/user_64px.png",
      role: "QA Engineer",
      bio: "Testing unread indicator functionality"
    },
    content: "Test article showcasing blue dot unread indicator for standard messages.",
    image: "https://placehold.co/400x240/007bff/ffffff?text=Dot+Blue/png",
    
    pages: [
      {
        label: "Overview",
        image: "https://placehold.co/400x240/007bff/ffffff?text=Dot+Indicator/png",
        content: 
          "{style:bold|Dot Indicator Test - Blue}\n\n" +
          "This article uses a {style:bold,color=#007bff|blue dot} indicator.\n\n" +
          "---\n\n" +
          "{style:bold|Configuration:}\n" +
          "Type: {style:italic|dot}\n" +
          "Color: {style:italic|#007bff (Blue)}\n\n" +
          "{style:bold|Best Used For:}\n" +
          "  * Standard messages\n" +
          "  * Information articles\n" +
          "  * General updates\n" +
          "  * Regular content (70-80% of articles)\n\n" +
          "---\n\n" +
          "{style:bold|Visual Characteristics:}\n" +
          "  * Simple dot shape\n" +
          "  * Blue color scheme\n" +
          "  * Subtle indicator\n" +
          "  * Clean, minimal design"
      }
    ],
    
    date: "2026-01-24T14:30:00Z",
    iconPath: "/content/common/assets/icons/message_64px.png",
    tags: ["Test", "UI", "Indicator", "Dot", "Blue"],
    visible: true,
    debugArticle: true,
    favoritable: true,
    unreadIndicator: {
      type: "dot",
      color: "#007bff"
    },
    credits: ["UI Testing Team", "QA Team"]
  },

  {
    slug: "unread-indicator-dot-green",
    title: "Dot Indicator - Green",
    publisher: "Ult & Co. Testing Lab",
    author: "UI Testing Team",
    authorProfile: {
      name: "UI Tester",
      avatar: "/content/common/assets/icons/user_64px.png",
      role: "QA Engineer",
      bio: "Testing unread indicator functionality"
    },
    content: "Test article showcasing green dot unread indicator for success messages.",
    image: "https://placehold.co/400x240/28a745/ffffff?text=Dot+Green/png",
    
    pages: [
      {
        label: "Overview",
        image: "https://placehold.co/400x240/28a745/ffffff?text=Green+Dot/png",
        content: 
          "{style:bold|Dot Indicator Test - Green}\n\n" +
          "This article uses a {style:bold,color=#28a745|green dot} indicator.\n\n" +
          "---\n\n" +
          "{style:bold|Configuration:}\n" +
          "Type: {style:italic|dot}\n" +
          "Color: {style:italic|#28a745 (Green)}\n\n" +
          "{style:bold|Best Used For:}\n" +
          "  * Success messages\n" +
          "  * Confirmations\n" +
          "  * Completed tasks\n" +
          "  * Positive updates\n\n" +
          "---\n\n" +
          "{style:bold|Visual Characteristics:}\n" +
          "  * Simple dot shape\n" +
          "  * Green color scheme\n" +
          "  * Positive indicator\n" +
          "  * Success state"
      }
    ],
    
    date: "2026-01-24T15:00:00Z",
    iconPath: "/content/common/assets/icons/message_64px.png",
    tags: ["Test", "UI", "Indicator", "Dot", "Green"],
    visible: true,
    debugArticle: true,
    favoritable: true,
    unreadIndicator: {
      type: "dot",
      color: "#28a745"
    },
    credits: ["UI Testing Team", "QA Team"]
  },

  {
    slug: "unread-indicator-star-red",
    title: "Star Indicator - Red",
    publisher: "Ult & Co. Testing Lab",
    author: "UI Testing Team",
    authorProfile: {
      name: "UI Tester",
      avatar: "/content/common/assets/icons/user_64px.png",
      role: "QA Engineer",
      bio: "Testing unread indicator functionality"
    },
    content: "Test article showcasing red star unread indicator for urgent/important content.",
    image: "https://placehold.co/400x240/dc3545/ffffff?text=Star+Red/png",
    
    pages: [
      {
        label: "Overview",
        image: "https://placehold.co/400x240/dc3545/ffffff?text=Red+Star/png",
        content: 
          "{style:bold|Star Indicator Test - Red}\n\n" +
          "This article uses a {style:bold,color=#dc3545|red star} indicator.\n\n" +
          "---\n\n" +
          "{style:bold|Configuration:}\n" +
          "Type: {style:italic|star}\n" +
          "Color: {style:italic|#dc3545 (Red)}\n\n" +
          "{style:bold|Best Used For:}\n" +
          "  * Urgent messages\n" +
          "  * Important alerts\n" +
          "  * Critical updates\n" +
          "  * Time-sensitive content\n\n" +
          "---\n\n" +
          "{style:bold|Visual Characteristics:}\n" +
          "  * Star shape icon\n" +
          "  * Red color scheme\n" +
          "  * Maximum visibility\n" +
          "  * Urgent indicator\n\n" +
          "---\n\n" +
          "{style:bold,color=#dc3545|Warning:}\n" +
          "Use red sparingly for truly urgent items only!"
      }
    ],
    
    date: "2026-01-24T15:30:00Z",
    iconPath: "/content/common/assets/icons/message_64px.png",
    tags: ["Test", "UI", "Indicator", "Star", "Red", "Urgent"],
    visible: true,
    debugArticle: true,
    favoritable: true,
    unreadIndicator: {
      type: "star",
      color: "#dc3545"
    },
    credits: ["UI Testing Team", "QA Team"]
  },

  {
    slug: "unread-indicator-badge-gold",
    title: "Badge Indicator - Gold",
    publisher: "Ult & Co. Testing Lab",
    author: "UI Testing Team",
    authorProfile: {
      name: "UI Tester",
      avatar: "/content/common/assets/icons/user_64px.png",
      role: "QA Engineer",
      bio: "Testing unread indicator functionality"
    },
    content: "Test article showcasing gold badge unread indicator with count.",
    image: "https://placehold.co/400x240/ffc107/333333?text=Badge+Gold/png",
    
    pages: [
      {
        label: "Overview",
        image: "https://placehold.co/400x240/ffc107/333333?text=Badge/png",
        content: 
          "{style:bold|Badge Indicator Test - Gold}\n\n" +
          "This article uses a {style:bold,color=#ffc107|gold badge} indicator.\n\n" +
          "---\n\n" +
          "{style:bold|Configuration:}\n" +
          "Type: {style:italic|badge}\n" +
          "Color: {style:italic|#ffc107 (Gold)}\n" +
          "Count: {style:italic|Optional number display}\n\n" +
          "{style:bold|Best Used For:}\n" +
          "  * Multiple updates\n" +
          "  * Unread count display\n" +
          "  * Notification aggregation\n" +
          "  * Premium highlights\n\n" +
          "---\n\n" +
          "{style:bold|Visual Characteristics:}\n" +
          "  * Badge shape with optional number\n" +
          "  * Gold color scheme\n" +
          "  * Shows quantity\n" +
          "  * Premium appearance\n\n" +
          "---\n\n" +
          "{style:bold|Note:}\n" +
          "Badge indicators can show counts when multiple\n" +
          "updates are available in the same category."
      }
    ],
    
    date: "2026-01-24T16:00:00Z",
    iconPath: "/content/common/assets/icons/message_64px.png",
    tags: ["Test", "UI", "Indicator", "Badge", "Gold"],
    visible: true,
    debugArticle: true,
    favoritable: true,
    unreadIndicator: {
      type: "badge",
      color: "#ffc107"
    },
    credits: ["UI Testing Team", "QA Team"]
  }
];
