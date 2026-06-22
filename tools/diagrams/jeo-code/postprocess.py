import sys
import re
import xml.etree.ElementTree as ET

def postprocess_svg(file_path, padding=24):
    # Register namespaces to avoid ns0: prefixes
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
    
    tree = ET.parse(file_path)
    root = tree.getroot()
    
    # Parse viewBox
    viewbox_str = root.attrib.get('viewBox')
    if not viewbox_str:
        print(f"No viewBox found in {file_path}")
        return
        
    parts = [float(x) for x in re.split(r'[\s,]+', viewbox_str.strip())]
    if len(parts) != 4:
        print(f"Invalid viewBox format in {file_path}: {viewbox_str}")
        return
        
    min_x, min_y, width, height = parts
    
    # Calculate new dimensions
    new_width = width + 2 * padding
    new_height = height + 2 * padding
    
    # Update viewBox
    root.attrib['viewBox'] = f"0 0 {new_width} {new_height}"
    # Update style max-width if present
    if 'style' in root.attrib:
        style = root.attrib['style']
        # Replace max-width: XXXpx with new width
        style = re.sub(r'max-width:\s*[0-9.]+px', f'max-width: {new_width}px', style)
        root.attrib['style'] = style
        
    # Create background gradient defs
    defs = ET.Element('{http://www.w3.org/2000/svg}defs')
    grad = ET.SubElement(defs, '{http://www.w3.org/2000/svg}linearGradient', {
        'id': 'bgGradient',
        'x1': '0%',
        'y1': '0%',
        'x2': '100%',
        'y2': '100%'
    })
    ET.SubElement(grad, '{http://www.w3.org/2000/svg}stop', {'offset': '0%', 'stop-color': '#0F172A'})
    ET.SubElement(grad, '{http://www.w3.org/2000/svg}stop', {'offset': '100%', 'stop-color': '#1E293B'})
    
    # Create background rect
    rect = ET.Element('{http://www.w3.org/2000/svg}rect', {
        'width': str(new_width),
        'height': str(new_height),
        'fill': 'url(#bgGradient)',
        'rx': '16'
    })
    
    # Create content wrapper group
    wrapper = ET.Element('{http://www.w3.org/2000/svg}g', {
        'transform': f'translate({padding}, {padding})'
    })
    
    # Identify elements to move to wrapper
    # We want to keep style, defs, and metadata at the top level, and move everything else to the wrapper
    to_move = []
    for child in list(root):
        tag_local = child.tag.split('}')[-1]
        if tag_local not in ('style', 'defs', 'metadata'):
            to_move.append(child)
            root.remove(child)
            
    # Add moved elements to wrapper
    for child in to_move:
        wrapper.append(child)
        
    # Insert defs, rect, and wrapper into root
    # defs and rect must be at the beginning so they render first (in the background)
    root.insert(0, defs)
    root.insert(1, rect)
    root.append(wrapper)
    
    # Write back
    tree.write(file_path, encoding='utf-8', xml_declaration=True)
    print(f"Successfully post-processed {file_path}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python postprocess.py <svg_file>")
        sys.exit(1)
    postprocess_svg(sys.argv[1])
