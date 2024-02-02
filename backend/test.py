def string_to_dict(response_string):
    # Split the response by empty lines
    entries = [entry.strip() for entry in response_string.strip().split('\n\n')]

    # Extract the plant type - always the first line
    plant_type = entries[0]

    # Initialize the data dictionary
    data = {
        "type": plant_type,
        "issues": []
    }

    # Iterate over entries starting from the second entry
    for i in range(1, len(entries), 3):
        if i + 1 >= len(entries) or i + 2 >= len(entries): # can't remember why I need the index + 2 ..?
            break

        name = entries[i] # second line of response is the name or type of deficiency
        description = entries[i + 1] # third line of response is the description
        percent = entries[i + 2] # four line of response is the probablity

        data["issues"].append({
            "type": type,
            "name": name,
            "description": description,
            "percent": percent
        })

        print(data)

    return data


def string_to_dict2(response_string):
    # Split the response by empty lines
    entries = [entry.strip() for entry in response_string.strip().split('\n\n')]

    # Initialize the data dictionary
    data = {
        "type": "",
        "issues": []
    }

    # Iterate over entries starting from the second entry
    for i in range(0, len(entries), 3):
        plant_type = entries[0] # first line of response
        if i + 1 >= len(entries) or i + 2 >= len(entries): # can't remember why I need the index + 2 ..?
            break

        deficiency_name = entries[i + 1] # second line of response 
        description = entries[i + 2] # third line of response 
        percent = entries[i + 3] # four line of response 

        data["type"] = plant_type
        print(data["type"])

        data["issues"].append({
            "name": deficiency_name,
            "description": description,
            "percent": percent
        })

        print(data)

    return data


# This is the correct implementation
def string_to_dict3(response_string):
    # Split the response by empty lines
    entries = [entry.strip() for entry in response_string.strip().split('\n\n')]

    plant_type = entries[0] # first line is plant type

    # Initialize the data dictionary
    data = {
        "type": plant_type,
        "issues": []
    }

    # Iterate over entries starting from the second entry
    iter_ent = iter(entries[1:])  # Skip the first entry
    for deficiency_name, desc, percent in zip(iter_ent, iter_ent, iter_ent):
        data["issues"].append({
            "name": plant_type,
            "description": desc,
            "percent": percent
        })

    return data



fake_response = """Poinsettia

Nutrient deficiency 

This is a common problem with poinsettias, especially if they are not getting enough fertilizer. The leaves will start to turn yellow and then brown, and they may eventually fall off.

80%

Overwatering

Poinsettias do not like to be overwatered, and this can cause the leaves to turn yellow and wilt.

60%
"""

result = string_to_dict2(fake_response)
result2 = string_to_dict3(fake_response)

print("First:")
print(result)
print("--------------------------------------------")
print("Second:")
print(result2)
