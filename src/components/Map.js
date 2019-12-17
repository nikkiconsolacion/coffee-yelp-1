import React from 'react';
import MapView from 'react-native-maps';
import { Linking, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { YELP_API_KEY } from 'react-native-dotenv';

let conquered = {
  "lNbKeOfCMTNkoihZHqrbrg": "Blue Bottle Coffee"
}; //just an example placeholder for the AsyncStorage object

export default class Map extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      markers: [],
      origin: { latitude: 35.294401000, longitude: -120.670121000 },
      category: 'coffee'
    };
  }

  getLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          let newOrigin = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          this.setState({
            origin: {
              latitude: newOrigin.latitude,
              longitude: newOrigin.longitude
            },
          });
          resolve(true);
        },
        err => {
          console.log('error');
          console.log(err);
          reject(reject);
        },
        { enableHighAccuracy: true, timeout: 2000, maximumAge: 1000 }
      );
    });
  };

  async componentDidMount() {
    await this.getLocation();
    await this.fetchMarkerData();
  }

  async fetchMarkerData() {

    return axios
      .get(`https://api.yelp.com/v3/businesses/search?term=${this.state.category}&latitude=${this.state.origin.latitude}&longitude=${this.state.origin.longitude}`, {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
        }
      })
      .then(responseJson => {
        this.setState({
          isLoading: false,
          markers: responseJson.data.businesses,
        });
      })
      .catch(error => {
        console.log(error);
      });
  }


  render() {
    return (
      <MapView
        style={{ flex: 1 }}
        provider="google"
        region={{
          latitude: this.state.origin.latitude,
          longitude: this.state.origin.longitude,
          latitudeDelta: 0.0100,
          longitudeDelta: 0.0100,
        }}
      >
        {this.state.isLoading
          ? null
          : this.state.markers.map(marker => {
              const coords = {
                latitude: marker.coordinates.latitude,
                longitude: marker.coordinates.longitude,
              };
              const url = marker.url;
              const markerId = marker.id;
              const nameOfMarker = `${marker.name}(${marker.rating} rating)`;
              const addressOfMarker = `${marker.location.address1}, ${marker.location.city}`;
              let hasConquered = false;

              return (
                <MapView.Marker
                  key={markerId}
                  coordinate={coords}
                  title={nameOfMarker}
                  description={addressOfMarker}
                  pinColor={ !(markerId in conquered) ? '#ff0000' : '#2cd142'}
                  onPress={() =>
                    Alert.alert(
                      'Redirect to website?',
                      'Or click cancel to stay in app',
                      [
                        {
                          text: !(markerId in conquered) ? 'Mark as conquered' : 'Unmark as conquered',
                          onPress: () => {
                            if (!(markerId in conquered)){
                              conquered[markerId] = marker.name
                            }
                            else if (markerId in conquered) {
                              delete conquered.markerId;
                            }
                            console.log('conquered: ', conquered);
                            console.log('marker id: ', marker.id);
                          },
                        },
                        {
                          text: 'Cancel',
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel',
                        },
                        { text: 'OK', onPress: () => Linking.openURL(url) },
                      ],
                      { cancelable: true }
                    )}
                >

                  {/* <Icon name="map-marker" size={30} color={ hasConquered === true ? '#2cd142' : '#ff0000' } /> */}

                </MapView.Marker>
              );
            })}

        <MapView.Marker coordinate={this.state.origin}>
          <Icon name="street-view" size={40} color={'#76BBB7'} />
        </MapView.Marker>
      </MapView>
    );
  }
}

