/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
// import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getDetail, getRestaurantAnalytics, getRestaurantOrders } from '../../api/RestaurantEndpoints'
import { nextStatus } from '../../api/OrderEndpoints'

import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { API_BASE_URL } from '@env'
import pendingOrderImage from '../../../assets/order_status_pending.png'
import inProcessOrderImage from '../../../assets/order_status_in_process.png'
import sentOrderImage from '../../../assets/order_status_sent.png'
import deliveredOrderImage from '../../../assets/order_status_delivered.png'
import ImageCard from '../../components/ImageCard'

export default function OrdersScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({ orders: [] })
  const [analytics, setAnalytics] = useState({})

  useEffect(() => {
    fetchRestaurantDetail()
    fetchRestaurantOrders()
    fetchRestaurantAnalytics()
  }, [route])

  const fetchRestaurantAnalytics = async () => {
    try {
      const analytics = await getRestaurantAnalytics(route.params.id)
      setAnalytics(analytics)
    } catch (error) {
      showMessage({
        message: `Error retrieving analytics. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  // ESTA FUNCION SE LLAMA CUANDO SE ABRE LA PANTALLA,
  // PARA OBTENER LOS PEDIDOS DE ESTE RESTAURANTE
  const fetchRestaurantOrders = async () => {
    try {
      // LLAMADA A LA API PARA OBTENER LOS PEDIDOS DE ESTE RESTAURANTE
      const orders = await getRestaurantOrders(route.params.id)
      // GUARDAR LOS PEDIDOS EN EL ESTADO
      setRestaurant(prev => ({ ...prev, orders }))
    } catch (error) {
      // SI HAY UN ERROR, MOSTRAR UN MENSAJE DE ERROR
      showMessage({
        message: `Error retrieving restaurant orders. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const handleNextStatus = async (order) => {
    try {
      await nextStatus(order.id)
      showMessage({
        message: 'Order status updated successfully',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      fetchRestaurantOrders()
    } catch (error) {
      showMessage({
        message: `Error updating order status. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderAnalytics = () => {
    return (
      <View style={styles.analyticsContainer}>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCell}>
              <TextRegular textStyle={styles.text}>
                Invoiced today
              </TextRegular>
              <TextSemiBold textStyle={styles.text}>
                {analytics?.invoicedToday ?? 0} €
              </TextSemiBold>
            </View>
            <View style={styles.analyticsCell}>
              <TextRegular textStyle={styles.text}>
                #Pending orders
              </TextRegular>
              <TextSemiBold textStyle={styles.text}>
                {analytics?.pendingOrders ?? 0}
              </TextSemiBold>
            </View>
          </View>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCell}>
                <TextRegular textStyle={styles.text}>
                  #Delivered today
                </TextRegular>
                <TextSemiBold textStyle={styles.text}>
                {analytics?.deliveredToday ?? 0}
                </TextSemiBold>
              </View>
              <View style={styles.analyticsCell}>
                <TextRegular textStyle={styles.text}>
                  #Yesterday orders
                </TextRegular>
                <TextSemiBold textStyle={styles.text}>
                {analytics?.yesterdayOrders ?? 0}
                </TextSemiBold>
              </View>
          </View>
        </View>
    )
  }
  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const getOrderImage = (status) => {
    switch (status) {
      case 'pending':
        return pendingOrderImage
      case 'in process':
        return inProcessOrderImage
      case 'sent':
        return sentOrderImage
      case 'delivered':
        return deliveredOrderImage
    }
  }

  const renderOrder = ({ item }) => {
    return (
      // IMAGEN SEGUN EL ESTADO DEL PEDIDO
      // (PENDIENTE, EN PROCESO, ENVIADO, ENTREGADO)
      <ImageCard image = {getOrderImage(item.status)}>
        {/* DIRECCION DE ENTREGA */}
        <TextSemiBold textStyle = {{ fontSize: 18 }}>
          {item.address}
        </TextSemiBold>

        {/* ESTADO DEL PEDIDO */}
        <TextRegular>
          Status: {item.status}
        </TextRegular>

        {/* PRECIO TOTAL DEL PEDIDO */}
        <TextRegular>
          Total price: {item.totalPrice} €
        </TextRegular>

        {/* BOTON PARA PASAR AL SIGUIENTE ESTADO */}
        <Pressable
          style={[styles.actionButton, { backgroundColor: GlobalStyles.brandPrimary }]}
          onPress={() => handleNextStatus(item)}>
            <TextRegular textStyle={{ color: 'white', textAlign: 'center' }}>
              Next status
            </TextRegular>

          </Pressable>
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no orders yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
      <View style={styles.container}>
        <FlatList
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderAnalytics()}
          </>
        }
        data = {restaurant.orders}
        renderItem = {renderOrder}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmptyOrdersList}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  analyticsContainer: {
    backgroundColor: GlobalStyles.brandPrimaryTap,
    paddingVertical: 10
  },
  analyticsRow: {

  },
  analyticsCell: {
    margin: 5,
    color: 'white',
    fontSize: 12,
    width: '45%',
    backgroundColor: GlobalStyles.brandPrimary,
    borderRadius: 8,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.41,
    shadowRadius: 3.11,
    elevation: 2
  }
})
