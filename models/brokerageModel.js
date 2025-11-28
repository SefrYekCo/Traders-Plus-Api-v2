const BrokerModel = (id, name, url, imageName) => {
    return {
        id: id,
        name: name,
        webAddress: url, 
        imageURL : imageName
    }
}

module.exports = BrokerModel