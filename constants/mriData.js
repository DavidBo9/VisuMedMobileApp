// Import MRI images
// Note: In a real app, these would be loaded from a server or stored differently
// but for demo purposes we'll import static assets
const mriSequences = [
    {
      id: '1',
      title: 'MRI Cerebral',
      type: 'eADC',
      description: 'La secuencia eADC (Coeficiente de Difusión Aparente) muestra áreas donde el movimiento del agua está restringido, lo que puede indicar un infarto cerebral reciente o una lesión aguda.',
      image: require('../../assets/images/mri/eadc1.jpg'),
    },
    {
      id: '2',
      title: 'MRI Cerebral',
      type: 'Sag T1 SE fs+C',
      description: 'La secuencia Sagital T1 con supresión de grasa y contraste (Sag T1 SE fs+C) muestra vistas laterales del cerebro que ayudan a evaluar estructuras cerebrales en el plano medio.',
      image: require('../../assets/images/mri/t1sag.jpg'),
    },
    {
      id: '3',
      title: 'MRI Cerebral',
      type: 'Ax T2 Flair',
      description: 'El Axial T2 FLAIR es una imagen del cerebro tomada en cortes horizontales que apaga el brillo del líquido que normalmente rodea el cerebro, para que se noten mejor posibles lesiones o zonas afectadas, especialmente en la sustancia blanca.',
      image: require('../../assets/images/mri/t2axial.jpg'),
    },
    {
      id: '4',
      title: 'MRI Cerebral',
      type: 'FILT_PHA: 3D Ax eSWAN',
      description: 'La secuencia eSWAN (Enhanced Susceptibility-Weighted Angiography) es muy sensible para detectar pequeñas hemorragias, depósitos de calcio o hierro, y vasos sanguíneos.',
      image: require('../../assets/images/mri/eswan1.jpg'),
    },
  ];
  
  const chatResponses = {
    'en que consiste este estudio': 'El Axial T2 FLAIR es una imagen del cerebro tomada en cortes horizontales, como si viéramos la cabeza desde arriba. Usa una técnica especial que apaga el brillo del líquido que normalmente rodea el cerebro, para que se noten mejor posibles lesiones o zonas afectadas, sobre todo en áreas profundas como la sustancia blanca. Este tipo de estudio se usa mucho cuando se quiere revisar si hay señales de inflamación, daños por enfermedades neurológicas o cambios que no se ven tan bien en otras imágenes.',
    'para qué sirve esta resonancia': 'Esta resonancia magnética cerebral permite visualizar en detalle las estructuras del cerebro para identificar anomalías como tumores, inflamaciones, sangrados, infartos, o cambios relacionados con enfermedades neurológicas como esclerosis múltiple o demencia.',
    'qué significa la parte oscura': 'Las áreas oscuras en una resonancia magnética cerebral generalmente representan estructuras que contienen líquido, como los ventrículos cerebrales que contienen líquido cefalorraquídeo, o pueden indicar áreas con menos densidad de tejido.',
    'es normal esta imagen': 'No puedo proporcionar diagnósticos médicos. Solo un médico especialista que conozca tu historial clínico completo puede interpretar correctamente estas imágenes y determinar si hay hallazgos normales o anormales.',
  };
  
  export { mriSequences, chatResponses };