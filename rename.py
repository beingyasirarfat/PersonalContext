import os
import shutil

def rename_and_move_files(source_dir, destination_dir):
    # Ensure destination directory exists, create if not
    if not os.path.exists(destination_dir):
        os.makedirs(destination_dir)

    # Get a list of all files in the source directory
    files = [f for f in os.listdir(source_dir) if os.path.isfile(os.path.join(source_dir, f))]

    # Sort files based on modification time
    files.sort(key=lambda x: os.path.getmtime(os.path.join(source_dir, x)))

    # Iterate through the files and move them with the new names
    for index, file_name in enumerate(files, start=1):
        # Get the file extension
        _, extension = os.path.splitext(file_name)

        # Generate the new file name
        new_file_name = f"{index}{extension}"

        # Build the full paths for the source and destination
        source_path = os.path.join(source_dir, file_name)
        destination_path = os.path.join(destination_dir, new_file_name)

        try:
            # Move the file to the destination with the new name
            shutil.move(source_path, destination_path)
            print(f"Moved {file_name} to {new_file_name}")
        except Exception as e:
            print(f"Error moving {file_name}: {str(e)}")

if __name__ == "__main__":
    # Specify your source and destination directories
    source_directory = "./wallpapers"
    destination_directory = "./wallpapers_sorted"

    # Call the function to rename and move files
    rename_and_move_files(source_directory, destination_directory)
    #rename and move because inplace rename is may overwrite files
