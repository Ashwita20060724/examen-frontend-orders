import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Pressable } from 'react-native'
// import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import { Formik } from 'formik'
import { getById, update } from '../../api/OrderEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
// import TextError from '../../components/TextError'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'

export default function EditOrderScreen ({ navigation, route }) {
  // ESTADO PARA GUARDAR LOS DATOS DEL PEDIDO
  const [order, setOrder] = useState({})
  // AÑADIMOS UN USE EFFECT PARA CARGAR EL PEDIDO
  // CUANDO SE ABRE LA PANTALLA
  useEffect(() => {
    fetchOrder()
  }, [])

  // COMPROBAR QUE TODOS LOS CAMPOS ESTAN RELLENOS
  const validationSchema = yup.object().shape({
    // SE PONEN EL ADDRESS Y EL PRICE PORQUE
    // SON LOS CAMPOS MOSTRADOS EN LA FIGURA 2
    deliveryAddress: yup.string().required('Address is required'),
    totalPrice: yup.number().typeError('Total price must be a number')
      .positive('Total price must be grater than 0').required('Price is needed')
  })

  // FUNCION PARA OBTENER LOS DATOS DEL PEDIDO
  const fetchOrder = async () => {
    try {
      // CONSEGUIR LOS PEDIDOS CON EL ID QUE SE RECIBE POR PARAMETRO
      const order = await getById(route.params.id)
      setOrder(order)
    } catch (error) {
      showMessage({
        message: `Error loading order. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  // GUARDAMOS LOS VALORES QUE HAYAMOS ACTUALIZADO
  const updateOrder = async (values) => {
    try {
      await update(route.params.id, values)
      showMessage({
        message: 'Order updated successfully',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('Orders', { dirty: true })
    } catch (error) {
      showMessage({
        message: `Error updating order. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <Formik
      validationSchema={validationSchema}
      enableReinitialize
      // LOS PONGO AQUI DIRECTAMENTE PORQUE SON 2, SINO CREO UNA FUNCION
      initialValues = {{
        deliveryAddress: order.deliveryAddress || '',
        totalPrice: order.totalPrice || ''
      }}
      onSubmit={updateOrder}
    >
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style = {{ alignItems: 'center' }} ></View>
            <View style = {{ width: '60%' }} > </View>
              <InputItem deliveryAddress="deliveryAddress" label="Delivery address"/>
              <InputItem totalPrice = "totalPrice" label = "Total price"/>

              <Pressable style={[styles.button, { backgroundColor: GlobalStyles.brandPrimary }]}
                onPress={handleSubmit}>
                <TextRegular textStyle={styles.text}>
                  Update order
                </TextRegular>
              </Pressable>
        </ScrollView>
      )
    }
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  }
})
