#!/bin/bash

# This script adds back-to-top button CSS and JS references to all HTML files

# Find all HTML files in the project
html_files=$(find . -name "*.html" | grep -v "node_modules")

for file in $html_files; do
  echo "Processing $file..."
  
  # Get the relative path to the root based on the file's directory depth
  dir_depth=$(echo "$file" | tr -cd '/' | wc -c)
  root_path=""
  
  if [ "$dir_depth" -eq 1 ]; then
    # Files in the root directory
    root_path="."
  else
    # Files in subdirectories
    for ((i=1; i<dir_depth; i++)); do
      root_path="../$root_path"
    done
  fi
  
  # Adjust the root path if it ends with "../"
  if [[ "$root_path" == *"../" ]]; then
    root_path=${root_path%*/}
  fi
  
  # If the file is in the root directory, use ./assets
  if [ "$file" == "./index.html" ]; then
    css_path="./assets/css/back-to-top.css"
    js_path="./assets/js/back-to-top.js"
  else
    # If the file is not in the aws-research directory with its subdirectories
    if [[ "$file" == *"/aws-research/"* || "$file" == "./aws-research/index.html" || "$file" == *"/math/"* || "$file" == "./math/index.html" || "$file" == *"/iterm/"* || "$file" == "./iterm/index.html" ]]; then
      css_path="/assets/css/back-to-top.css"
      js_path="/assets/js/back-to-top.js"
    else
      # For other files, calculate the relative path
      css_path="${root_path}/assets/css/back-to-top.css"
      js_path="${root_path}/assets/js/back-to-top.js"
    fi
  fi
  
  # Check if the back-to-top references are already in the file
  if ! grep -q "back-to-top.css" "$file"; then
    # Find the line with smooth-scroll.js and add our references after it
    sed -i '' -e '/smooth-scroll.js/a\
    \
    <!-- Back to top button -->\
    <link rel="stylesheet" href="'"$css_path"'">\
    <script src="'"$js_path"'" defer></script>' "$file"
    echo "Added back-to-top references to $file"
  else
    echo "File $file already has back-to-top references, skipping..."
  fi
done

echo "All HTML files have been updated!" 