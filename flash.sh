destination_folder="/sdcard/Groove"
#node modules seperated by spaces
NODE_MODULES="jquery bootstrap"
#folders and files to copy, seperated by spaces
ITEMS_TO_COPY="assets dist index.html"

if [ ! -f package.json ] && [[ ! $* == *--no-check-dir* ]]; then
    echo 1>&2 "error: missing package.json in $(pwd), check if this is the project root"
    echo 1>&2 "error: if it is, rerun this script with --no-check-dir"
    exit 1
fi

if [ ! -d node_modules ]; then
    echo 1>&2 "error: node_modules missing, did you forget to run npm install?"
    exit 1
fi

devices=$(adb devices | grep -v "List of devices attached" | cut -f 1 | awk NF)

if [ -z $devices ]; then
    echo 1>&2 "error: no adb devices found!"
    exit 1
fi

num_devices=$(echo "$devices" | wc -l)

if [ $num_devices -ge 2 ] && [[ ! $* == *--multi* ]]; then
    echo 1>&2 "error: multiple devices detected, must specify --multi to flash all"
    exit 1
fi

#debug script
#set -x

for device in $devices; do
    echo "starting flash for device $device..."
    echo "removing $destination_folder"
    adb -s $device shell rm -rf "$destination_folder"
    echo "done removing $destination_folder"

    adb -s $device shell mkdir "$destination_folder"

    echo "copying files..."
    for item in $ITEMS_TO_COPY; do
        item_basename="$(basename "$item")"
        adb -s $device push "$item" "$destination_folder/$item_basename" 1>/dev/null
    done
    echo "done copying files"

    echo "copying node_modules..."
    for module in $NODE_MODULES; do
        adb -s $device push node_modules/$module "$destination_folder/node_modules/$module" 1>/dev/null
    done
    echo "done copying node_modules"

    echo "done flash for device $device"
done
