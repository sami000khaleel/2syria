{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": 3,
   "metadata": {},
   "outputs": [],
   "source": [
    "import numpy as np\n",
    "import tensorflow as tf\n",
    "from tensorflow.keras.applications import ResNet50\n",
    "from tensorflow.keras.applications.resnet50 import preprocess_input\n",
    "from tensorflow.keras.preprocessing import image\n",
    "from tensorflow.keras.models import Model\n",
    "from tensorflow.keras.layers import GlobalAveragePooling2D\n",
    "from sklearn.metrics.pairwise import cosine_similarity\n",
    "import os"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 4,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pickle\n",
    "features_file = 'features.pkl'\n",
    "\n",
    "# Function to save features to disk\n",
    "def save_features(features, filename):\n",
    "    with open(filename, 'wb') as f:\n",
    "        pickle.dump(features, f)\n",
    "\n",
    "# Function to load features from disk\n",
    "def load_features(filename):\n",
    "    with open(filename, 'rb') as f:\n",
    "        features = pickle.load(f)\n",
    "    return features\n"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 5,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Load pre-trained ResNet50 model\n",
    "base_model = ResNet50(weights='imagenet', include_top=False)\n",
    "model = Model(inputs=base_model.input, outputs=GlobalAveragePooling2D()(base_model.output))\n"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 6,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Function to preprocess input image\n",
    "def preprocess_image(img_path):\n",
    "    img = image.load_img(img_path, target_size=(224, 224))\n",
    "    img_array = image.img_to_array(img)\n",
    "    img_array = np.expand_dims(img_array, axis=0)\n",
    "    img_array = preprocess_input(img_array)\n",
    "    return img_array"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 7,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Function to extract features from an image\n",
    "def extract_features(img_path):\n",
    "    img_array = preprocess_image(img_path)\n",
    "    features = model.predict(img_array)\n",
    "    return features\n"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 13,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Function to compute similarity between two feature vectors using cosine similarity\n",
    "def compute_similarity(feature1, feature2):\n",
    "    similarity = cosine_similarity(feature1.reshape(1, -1), feature2.reshape(1, -1))\n",
    "    return similarity[0][0]\n"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 9,
   "metadata": {},
   "outputs": [],
   "source": [
    "def get_images_features():\n",
    "    if os.path.exists(features_file) :\n",
    "        return load_features(features_file)    \n",
    "    else:\n",
    "        dataset_path = os.path.join(os.path.dirname(os.getcwd()),'server','data','images')\n",
    "\n",
    "        # Extract features from all images in the dataset\n",
    "        image_features = {}\n",
    "        for img_file in os.listdir(dataset_path):\n",
    "           for img_name in os.listdir(os.path.join(dataset_path,img_file)): \n",
    "            img_path = os.path.join(dataset_path,img_file, img_name)\n",
    "            features = extract_features(img_path)\n",
    "            image_features[img_name] = features\n",
    "            save_features(image_features,features_file)\n",
    "        return image_features\n"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 67,
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "1/1 [==============================] - 0s 261ms/step\n"
     ]
    }
   ],
   "source": [
    "# Input image path\n",
    "input_image_path ='C:/Users/sami/Desktop/projects/2syria/server/data/images/ChIJba2CbpuuJhUR5Td9vMgQrS4/AWU5eFhMp2_qiQ0vBa5WSfSVN-q6zkqzUJqUKOsuf0sVXcchLS_LUbd1bXgyuqkbUoA03QC5lO_vRsGSIcPvYs-n9VquHYvPO2RZX8qq8RoelblRD2tqgyv-E7K6VPMrsY7p8WluI7a6RmRWtf8BCoPW2zm19P6zkUkOtBJFV5YBsXxwqaSF.jpg'\n",
    "\n",
    "# Extract features from the input image\n",
    "input_image_features = extract_features(input_image_path)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 102,
   "metadata": {},
   "outputs": [],
   "source": [
    "\n",
    "# Compute similarity between the input image and images in the dataset\n",
    "def get_similarities(input_image_features):\n",
    "    similarities = {}\n",
    "    for img_name, features in get_images_features().items():\n",
    "        if len(similarities)>=15:\n",
    "            break\n",
    "        similarity = compute_similarity(input_image_features, features)\n",
    "\n",
    "        if(similarity>0.65):\n",
    "           similarities[img_name] = similarity\n",
    "   \n",
    "# Sort the images based on similarity\n",
    "    sorted_images = sorted(similarities.items(), key=lambda x: x[1], reverse=True)\n",
    "# Output the most similar images\n",
    "    return sorted_images    "
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 103,
   "metadata": {},
   "outputs": [],
   "source": [
    "def go(image_url):\n",
    "    input_image_features=extract_features(image_url)\n",
    "    similarities=get_similarities(input_image_features)\n",
    "    return similarities"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 104,
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "1/1 [==============================] - 0s 355ms/step\n"
     ]
    },
    {
     "data": {
      "text/plain": [
       "[('AWU5eFhMp2_qiQ0vBa5WSfSVN-q6zkqzUJqUKOsuf0sVXcchLS_LUbd1bXgyuqkbUoA03QC5lO_vRsGSIcPvYs-n9VquHYvPO2RZX8qq8RoelblRD2tqgyv-E7K6VPMrsY7p8WluI7a6RmRWtf8BCoPW2zm19P6zkUkOtBJFV5YBsXxwqaSF.jpg',\n",
       "  0.99999994),\n",
       " ('AWU5eFgruMSYk48A1bAi6QqA-SRivsIgvKjfJPrFO42hv16xmCWAOLPyugtEY2prqecNmoOgT0c8buz1YupZoqfPWWsILf8RpaRoQQTOwcVPIBAiCBWSjnkGrEUV5UgKRBMFy0LkD1dWXAolWZojtKhxHBFyyi999Dqg1lYmPZqMgoiXMiwR.jpg',\n",
       "  0.6988811),\n",
       " ('AWU5eFgIfwYHEOYpKU05HQQ5w0_NsvWXu5vxmgPR6RdZEeb_BcC-sRtcoG9XeZ5bKEYBnXVdfShla7YSE1iZV-S2sx-zARVm0w5NuoLZ12brbAeA3JnnTZ7y4Ke7xQiqrviOMGp5cvHx8nNSkWDVLnedJQttTAGYvmNnZ809RWVdSTJyuqkl.jpg',\n",
       "  0.68572575),\n",
       " ('AWU5eFgaxkEttoX7re7ubyA8KAQyJLutS0ZRcZ9TqT3CVORWNh1ey7P91zB49d0AKUqaOz2p_1ti-VwV4ZBK5_3Ik11JAxTG1aGk1wJqdNPOtjdXWLc-Y4p_075U1hNBOBl7iQZ8goMh504eNlojkH1gSBSqomVPJPMewH1hHnjewDsdlmU-.jpg',\n",
       "  0.68496263),\n",
       " ('AWU5eFg-k5HRiOim9Awyv67NUjEB5FzliaoifnaRgxTsxBDjwRcILSB-QmQ0WSqt5vuJeMRqcf-jZKGwY2CEdA4O-P9O2Vv1B-OZhJ0SiiLyeiKu-AWD_-dgXXqZq_fJ6fyr7beQy7k3tdcvWIvm59tdRCEYK7EXcjoZCMPlqwUgEMFCScnv.jpg',\n",
       "  0.66473424),\n",
       " ('AWU5eFjKWBBRuGNA0uOnMn8IIdY-mDZHfU69xHhJ3ydYYGS-TUsXKI_0gHDSPL8M3hyZvslgXEP31cK92RpgDBkc-b1w-GrezOysDWAO05vVBEBpxXvoLuMqdDedoGb-YNqs-odSh-SFvfaaOp-RQRmTvkwPvZ21iREqZoCbnA3fNENX0n6s.jpg',\n",
       "  0.66304934),\n",
       " ('AWU5eFhkjCg7iWb7LJVTMp5i4R2FmSo943BFzv9Inoh1v6fyxAzRS_qyGVFhuTJQe5sZMFS5kwHFdkCPdjewozALfx_t2Oy_JlyPtvvhj5u8ebGs_nVHgxpjqnMGK6v3cTJ3UDFnh60FBelP0DPu5JamGCH42xJ-XF7sd9sGs2Jel_-kAgcP.jpg',\n",
       "  0.66091406),\n",
       " ('AWU5eFhRYMjAxY1X_uBE3EMe3ugLmpfNb7hfkXTr8fRiVyhZAcOa4j-zQQUjE_ayPxguMexFCQkO5pjA5uEuf7EcMY4vQV8ArDSd3KBeNuzYB2LLx2FSyqloeBcLCBEx913rLXFvdyaGecothnDFjyUvxXUR61F33RFbW7KTxsaUToW-wQCQ.jpg',\n",
       "  0.65545225)]"
      ]
     },
     "execution_count": 104,
     "metadata": {},
     "output_type": "execute_result"
    }
   ],
   "source": [
    "go('C:/Users/sami/Desktop/projects/2syria/server/data/images/ChIJba2CbpuuJhUR5Td9vMgQrS4/AWU5eFhMp2_qiQ0vBa5WSfSVN-q6zkqzUJqUKOsuf0sVXcchLS_LUbd1bXgyuqkbUoA03QC5lO_vRsGSIcPvYs-n9VquHYvPO2RZX8qq8RoelblRD2tqgyv-E7K6VPMrsY7p8WluI7a6RmRWtf8BCoPW2zm19P6zkUkOtBJFV5YBsXxwqaSF.jpg')\n"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3 (ipykernel)",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.11.5"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 2
}
