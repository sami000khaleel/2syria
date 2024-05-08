# %%
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D
from sklearn.metrics.pairwise import cosine_similarity
import os

# %%
import pickle
features_file = 'features.pkl'

# Function to save features to disk
def save_features(features, filename):
    with open(filename, 'wb') as f:
        pickle.dump(features, f)

# Function to load features from disk
def load_features(filename):
    with open(filename, 'rb') as f:
        features = pickle.load(f)
    return features


# %%
# Load pre-trained ResNet50 model
base_model = ResNet50(weights='imagenet', include_top=False)
model = Model(inputs=base_model.input, outputs=GlobalAveragePooling2D()(base_model.output))


# %%
# Function to preprocess input image
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

# %%
# Function to extract features from an image
def extract_features(img_path):
    img_array = preprocess_image(img_path)
    features = model.predict(img_array)
    return features


# %%
# Function to compute similarity between two feature vectors using cosine similarity
def compute_similarity(feature1, feature2):
    similarity = cosine_similarity(feature1.reshape(1, -1), feature2.reshape(1, -1))
    return similarity[0][0]


# %%
def get_images_features():
    if os.path.exists(features_file) :
        return load_features(features_file)    
    else:
        dataset_path = os.path.join(os.path.dirname(os.getcwd()),'server','data','images')

        # Extract features from all images in the dataset
        image_features = {}
        for img_file in os.listdir(dataset_path):
           for img_name in os.listdir(os.path.join(dataset_path,img_file)): 
            img_path = os.path.join(dataset_path,img_file, img_name)
            features = extract_features(img_path)
            image_features[img_name] = features
            save_features(image_features,features_file)
        return image_features


# %%
# Input image path
input_image_path ='C:/Users/sami/Desktop/projects/2syria/server/data/images/ChIJba2CbpuuJhUR5Td9vMgQrS4/AWU5eFhMp2_qiQ0vBa5WSfSVN-q6zkqzUJqUKOsuf0sVXcchLS_LUbd1bXgyuqkbUoA03QC5lO_vRsGSIcPvYs-n9VquHYvPO2RZX8qq8RoelblRD2tqgyv-E7K6VPMrsY7p8WluI7a6RmRWtf8BCoPW2zm19P6zkUkOtBJFV5YBsXxwqaSF.jpg'

# Extract features from the input image
input_image_features = extract_features(input_image_path)

# %%

# Compute similarity between the input image and images in the dataset
def get_similarities(input_image_features):
    similarities = {}
    for img_name, features in get_images_features().items():
        similarity = compute_similarity(input_image_features, features)

        if(similarity>0.60):
           similarities[img_name] = similarity
        if(len(similarities)>=20):
            break
# Sort the images based on similarity
    sorted_images = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
# Output the most similar images
    return sorted_images    

# %
def go(image_url):
    input_image_features=extract_features(image_url)
    res=get_similarities(input_image_features)
    similarities=[[img[0],img[1]] for img in res]
    print(similarities)
    return similarities

# %%
go('C:/Users/sami/Desktop/projects/2syria/server/data/images/ChIJba2CbpuuJhUR5Td9vMgQrS4/AWU5eFhMp2_qiQ0vBa5WSfSVN-q6zkqzUJqUKOsuf0sVXcchLS_LUbd1bXgyuqkbUoA03QC5lO_vRsGSIcPvYs-n9VquHYvPO2RZX8qq8RoelblRD2tqgyv-E7K6VPMrsY7p8WluI7a6RmRWtf8BCoPW2zm19P6zkUkOtBJFV5YBsXxwqaSF.jpg')



